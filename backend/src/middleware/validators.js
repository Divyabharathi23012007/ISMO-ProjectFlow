const { body, param, query, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return errorResponse(res, 'Validation failed', 400, formatted);
  }
  next();
};

const authValidators = {
  register: [
    body('fullName').trim().notEmpty().withMessage('Full name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
    body('email').trim().notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  login: [
    body('email').trim().notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
};

const projectValidators = {
  create: [
    body('name').trim().notEmpty().withMessage('Project name is required')
      .isLength({ max: 200 }).withMessage('Project name cannot exceed 200 characters'),
    body('description').optional().trim(),
    body('status').optional()
      .isIn(['Not Started', 'In Progress', 'Completed']).withMessage('Invalid status'),
    body('startDate').optional().isDate().withMessage('Invalid start date format'),
    body('endDate').optional().isDate().withMessage('Invalid end date format'),
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid project ID'),
    body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty')
      .isLength({ max: 200 }).withMessage('Project name cannot exceed 200 characters'),
    body('status').optional()
      .isIn(['Not Started', 'In Progress', 'Completed']).withMessage('Invalid status'),
    body('startDate').optional().isDate().withMessage('Invalid start date format'),
    body('endDate').optional().isDate().withMessage('Invalid end date format'),
  ],
  idParam: [param('id').isInt({ min: 1 }).withMessage('Invalid project ID')],
};

const taskValidators = {
  create: [
    body('name').trim().notEmpty().withMessage('Task name is required')
      .isLength({ max: 200 }).withMessage('Task name cannot exceed 200 characters'),
    body('projectId').notEmpty().withMessage('Project ID is required')
      .isInt({ min: 1 }).withMessage('Invalid project ID'),
    body('description').optional().trim(),
    body('priority').optional()
      .isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
    body('status').optional()
      .isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),
    body('dueDate').optional().isDate().withMessage('Invalid due date format'),
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid task ID'),
    body('name').optional().trim().notEmpty().withMessage('Task name cannot be empty')
      .isLength({ max: 200 }).withMessage('Task name cannot exceed 200 characters'),
    body('priority').optional()
      .isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
    body('status').optional()
      .isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),
    body('dueDate').optional().isDate().withMessage('Invalid due date format'),
  ],
  idParam: [param('id').isInt({ min: 1 }).withMessage('Invalid task ID')],
};

module.exports = { validate, authValidators, projectValidators, taskValidators };
