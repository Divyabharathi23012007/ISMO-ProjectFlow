const { Op } = require('sequelize');
const { Project, Task } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

const getAllProjects = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    const where = { userId: req.user.id };
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (status) where.status = status;

    const validSortFields = ['name', 'status', 'startDate', 'endDate', 'createdAt'];
    const order = validSortFields.includes(sortBy) ? [[sortBy, sortOrder === 'ASC' ? 'ASC' : 'DESC']] : [['createdAt', 'DESC']];

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Project.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset,
      include: [{ model: Task, as: 'tasks', attributes: ['id', 'status'] }],
    });

    return successResponse(res, {
      projects: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Task, as: 'tasks' }],
    });

    if (!project) return errorResponse(res, 'Project not found', 404);
    return successResponse(res, { project });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;
    const project = await Project.create({ name, description, status, startDate, endDate, userId: req.user.id });
    return successResponse(res, { project }, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!project) return errorResponse(res, 'Project not found', 404);

    const { name, description, status, startDate, endDate } = req.body;
    await project.update({ name, description, status, startDate, endDate });
    return successResponse(res, { project }, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!project) return errorResponse(res, 'Project not found', 404);

    await project.destroy();
    return successResponse(res, null, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject };
