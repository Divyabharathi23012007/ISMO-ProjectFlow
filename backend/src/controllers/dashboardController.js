const { Project, Task } = require('../models');
const { successResponse } = require('../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      totalProjects,
      projectsInProgress,
      projectsCompleted,
      projectsNotStarted,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
    ] = await Promise.all([
      Project.count({ where: { userId } }),
      Project.count({ where: { userId, status: 'In Progress' } }),
      Project.count({ where: { userId, status: 'Completed' } }),
      Project.count({ where: { userId, status: 'Not Started' } }),
      Task.count({ where: { userId } }),
      Task.count({ where: { userId, status: 'Completed' } }),
      Task.count({ where: { userId, status: 'Pending' } }),
      Task.count({ where: { userId, status: 'In Progress' } }),
    ]);

    return successResponse(res, {
      projects: { total: totalProjects, inProgress: projectsInProgress, completed: projectsCompleted, notStarted: projectsNotStarted },
      tasks: { total: totalTasks, completed: completedTasks, pending: pendingTasks, inProgress: inProgressTasks },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
