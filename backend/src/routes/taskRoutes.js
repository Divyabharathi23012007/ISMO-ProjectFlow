const express = require('express');
const { getAllTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { taskValidators, validate } = require('../middleware/validators');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllTasks);
router.get('/:id', taskValidators.idParam, validate, getTaskById);
router.post('/', taskValidators.create, validate, createTask);
router.put('/:id', taskValidators.update, validate, updateTask);
router.delete('/:id', taskValidators.idParam, validate, deleteTask);

module.exports = router;
