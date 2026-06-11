import express from 'express';
import { Op } from 'sequelize';
import { Task, Employee } from '../models/index.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { logActivity } from '../middleware/audit.js';

const router = express.Router();

// @desc    Assign a task to an employee
// @route   POST /api/tasks
// @access  Private (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  const { title, description, dueDate, assignedTo } = req.body;

  try {
    if (!title || !assignedTo) {
      return res.status(400).json({ message: 'Title and assignedTo are required fields' });
    }

    const employee = await Employee.findByPk(assignedTo);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      assignedTo,
      status: 'pending'
    });

    await logActivity(
      req.user.id,
      req.user.email,
      'create_task',
      { taskId: task.id, title, assignedTo: employee.fullName },
      req.ip
    );

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get tasks list (Admin gets all; Employee gets their own)
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Filter by search
    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      whereClause.assignedTo = employee.id;
    }

    const { count, rows: tasks } = await Task.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{ model: Employee, as: 'employee', attributes: ['id', 'fullName', 'email', 'position', 'department'] }]
    });

    res.json({
      tasks,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalTasks: count
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update a task (Admin can update everything; Employee can only update status)
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { title, description, dueDate, status, assignedTo } = req.body;

  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAdmin = req.user.role === 'admin';
    let employee = null;

    if (!isAdmin) {
      employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || task.assignedTo !== employee.id) {
        return res.status(403).json({ message: 'Access denied: Cannot update tasks assigned to other employees' });
      }

      if (status) {
        if (!['pending', 'in_progress', 'completed'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status value' });
        }
        task.status = status;
      }
    } else {
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (status) {
        if (!['pending', 'in_progress', 'completed'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status value' });
        }
        task.status = status;
      }
      if (assignedTo) {
        const empExists = await Employee.findByPk(assignedTo);
        if (!empExists) {
          return res.status(404).json({ message: 'Assigned employee not found' });
        }
        task.assignedTo = assignedTo;
      }
    }

    await task.save();

    await logActivity(
      req.user.id,
      req.user.email,
      'update_task',
      { taskId: task.id, title: task.title, status: task.status },
      req.ip
    );

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskId = task.id;
    const taskTitle = task.title;

    await task.destroy();

    await logActivity(
      req.user.id,
      req.user.email,
      'delete_task',
      { taskId, title: taskTitle },
      req.ip
    );

    res.json({ message: 'Task successfully deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
