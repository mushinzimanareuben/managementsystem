import express from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Employee, Submission as SqlSubmission } from '../models/index.js';
import MongoSubmission from '../models/mongoSubmission.js';
import { isMongoConnected } from '../config/db.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Export Employees to Excel
// @route   GET /api/export/employees/excel
// @access  Private (Admin only)
router.get('/employees/excel', protect, adminOnly, async (req, res) => {
  try {
    const employees = await Employee.findAll({ order: [['fullName', 'ASC']] });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees');

    worksheet.columns = [
      { header: 'Full Name', key: 'fullName', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone Number', key: 'phoneNumber', width: 15 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Salary ($)', key: 'salary', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Employment Date', key: 'employmentDate', width: 15 },
    ];

    // Add styles to header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    employees.forEach(emp => {
      worksheet.addRow({
        fullName: emp.fullName,
        email: emp.email,
        phoneNumber: emp.phoneNumber || 'N/A',
        position: emp.position,
        department: emp.department,
        salary: parseFloat(emp.salary),
        status: emp.status,
        employmentDate: emp.employmentDate,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=employees_report.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ message: 'Excel export failed' });
  }
});

// @desc    Export Employees to PDF
// @route   GET /api/export/employees/pdf
// @access  Private (Admin only)
router.get('/employees/pdf', protect, adminOnly, async (req, res) => {
  try {
    const employees = await Employee.findAll({ order: [['fullName', 'ASC']] });

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=employees_report.pdf');

    doc.pipe(res);

    // Document Header
    doc.fontSize(20).text('Smart Company Management System', { align: 'center' });
    doc.fontSize(14).text('Employee Directory Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, { align: 'right' });
    doc.moveDown();

    // Table Header
    const tableTop = 120;
    doc.font('Helvetica-Bold');
    doc.fontSize(10);
    doc.text('Name', 30, tableTop);
    doc.text('Email', 140, tableTop);
    doc.text('Position', 300, tableTop);
    doc.text('Department', 410, tableTop);
    doc.text('Status', 510, tableTop);

    // Draw line
    doc.moveTo(30, tableTop + 15).lineTo(560, tableTop + 15).stroke();

    doc.font('Helvetica');
    let y = tableTop + 25;

    employees.forEach(emp => {
      // Handle page break
      if (y > 750) {
        doc.addPage();
        y = 50;
        doc.font('Helvetica-Bold');
        doc.text('Name', 30, y);
        doc.text('Email', 140, y);
        doc.text('Position', 300, y);
        doc.text('Department', 410, y);
        doc.text('Status', 510, y);
        doc.moveTo(30, y + 15).lineTo(560, y + 15).stroke();
        doc.font('Helvetica');
        y += 25;
      }

      doc.text(emp.fullName.substring(0, 18), 30, y);
      doc.text(emp.email.substring(0, 28), 140, y);
      doc.text(emp.position.substring(0, 18), 300, y);
      doc.text(emp.department.substring(0, 16), 410, y);
      doc.text(emp.status, 510, y);

      y += 20;
    });

    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ message: 'PDF export failed' });
  }
});

// @desc    Export Submissions to Excel
// @route   GET /api/export/submissions/excel
// @access  Private (Admin only)
router.get('/submissions/excel', protect, adminOnly, async (req, res) => {
  try {
    let submissions = [];
    if (isMongoConnected) {
      submissions = await MongoSubmission.find().sort({ createdAt: -1 });
    } else {
      const sqlResults = await SqlSubmission.findAll({ order: [['createdAt', 'DESC']] });
      submissions = sqlResults.map(item => item.toJSON());
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Form Submissions');

    worksheet.columns = [
      { header: 'Submission ID', key: 'id', width: 25 },
      { header: 'Type', key: 'type', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Details (JSON)', key: 'data', width: 50 },
      { header: 'CV Link', key: 'cvUrl', width: 25 },
      { header: 'Submitted At', key: 'createdAt', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    submissions.forEach(sub => {
      const rawData = isMongoConnected ? sub.data : sub.data;
      worksheet.addRow({
        id: (sub._id || sub.id).toString(),
        type: sub.type,
        status: sub.status,
        data: JSON.stringify(rawData),
        cvUrl: sub.cvUrl || 'N/A',
        createdAt: sub.createdAt,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=submissions_report.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Submissions Excel export error:', error);
    res.status(500).json({ message: 'Excel export failed' });
  }
});

export default router;
