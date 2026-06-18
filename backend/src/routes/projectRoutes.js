const express = require('express');
const { getAllProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { projectValidators, validate } = require('../middleware/validators');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllProjects);
router.get('/:id', projectValidators.idParam, validate, getProjectById);
router.post('/', projectValidators.create, validate, createProject);
router.put('/:id', projectValidators.update, validate, updateProject);
router.delete('/:id', projectValidators.idParam, validate, deleteProject);

module.exports = router;
