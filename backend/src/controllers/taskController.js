const { Op } = require('sequelize');
const { Task, Project } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

const getAllTasks = async (req, res, next) => {
  try {
    const { search, status, priority, projectId, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    const where = { userId: req.user.id };
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;

    const validSortFields = ['name', 'status', 'priority', 'dueDate', 'createdAt'];
    const order = validSortFields.includes(sortBy) ? [[sortBy, sortOrder === 'ASC' ? 'ASC' : 'DESC']] : [['createdAt', 'DESC']];

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Task.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset,
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }],
    });

    return successResponse(res, {
      tasks: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'status'] }],
    });

    if (!task) return errorResponse(res, 'Task not found', 404);
    return successResponse(res, { task });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { name, description, priority, status, dueDate, projectId } = req.body;

    // Ensure project belongs to user
    const project = await Project.findOne({ where: { id: projectId, userId: req.user.id } });
    if (!project) return errorResponse(res, 'Project not found or unauthorized', 404);

    const task = await Task.create({ name, description, priority, status, dueDate, projectId, userId: req.user.id });
    return successResponse(res, { task }, 'Task created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) return errorResponse(res, 'Task not found', 404);

    const { name, description, priority, status, dueDate } = req.body;
    await task.update({ name, description, priority, status, dueDate });
    return successResponse(res, { task }, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) return errorResponse(res, 'Task not found', 404);

    await task.destroy();
    return successResponse(res, null, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
