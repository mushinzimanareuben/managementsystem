import express from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { Employee, User } from '../models/index.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload, handleUpload } from '../middleware/upload.js';

const router = express.Router();

// @desc    Get all employees with pagination, search, and filtering
// @route   GET /api/employees
// @access  Private (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { position: { [Op.like]: `%${search}%` } }
      ];
    }

    if (department) {
      whereClause.department = department;
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: employees } = await Employee.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'email', 'role'] }]
    });

    res.json({
      employees,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalEmployees: count
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single employee details
// @route   GET /api/employees/:id
// @access  Private (Admin, or Employee viewing themselves)
router.get('/:id', protect, async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'email', 'role'] }]
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Role Check: Admins can view any employee. Employees can only view themselves.
    if (req.user.role !== 'admin' && employee.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this profile' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a new employee and associate with a User account
// @route   POST /api/employees
// @access  Private (Admin only)
router.post('/', protect, adminOnly, upload.single('photo'), async (req, res) => {
  const { fullName, email, phoneNumber, position, department, salary, address, employmentDate, status } = req.body;

  try {
    // Check if email already registered in User or Employee tables
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'A user account with this email already exists' });
    }

    // Process photo upload
    const photoUrl = req.file ? await handleUpload(req.file) : null;

    // Create User record for Employee Login
    const defaultPassword = 'Employee123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'employee'
    });

    // Create Employee record
    const employee = await Employee.create({
      fullName,
      email,
      phoneNumber,
      position,
      department,
      salary: parseFloat(salary) || 0.00,
      address,
      photoUrl,
      employmentDate: employmentDate || new Date(),
      status: status || 'active',
      userId: user.id
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private
router.put('/:id', protect, upload.single('photo'), async (req, res) => {
  const { fullName, phoneNumber, position, department, salary, address, employmentDate, status } = req.body;

  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isSelf = employee.userId === req.user.id;

    // Authorization: User must be admin or updating their own profile
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Process uploaded photo if present
    if (req.file) {
      employee.photoUrl = await handleUpload(req.file);
    }

    // Common fields editable by both Admin and Employee (self)
    if (fullName) employee.fullName = fullName;
    if (phoneNumber !== undefined) employee.phoneNumber = phoneNumber;
    if (address !== undefined) employee.address = address;

    // Admin-only fields (restricted from Employees modifying their own salary/role)
    if (isAdmin) {
      if (position) employee.position = position;
      if (department) employee.department = department;
      if (salary !== undefined) employee.salary = parseFloat(salary);
      if (employmentDate) employee.employmentDate = employmentDate;
      if (status) employee.status = status;
    }

    await employee.save();

    // Also update email in User table if changed (Admin-only capability, though disabled here for simplicity)
    
    res.json(employee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete an employee and their User account
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const associatedUserId = employee.userId;

    // Delete Employee record
    await employee.destroy();

    // Delete User login record if it exists
    if (associatedUserId) {
      await User.destroy({ where: { id: associatedUserId } });
    }

    res.json({ message: 'Employee and user login successfully deleted' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
