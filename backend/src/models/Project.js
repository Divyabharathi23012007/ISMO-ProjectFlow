const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Project name cannot be empty' },
      len: { args: [1, 200], msg: 'Project name must be between 1-200 characters' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Not Started', 'In Progress', 'Completed'),
    allowNull: false,
    defaultValue: 'Not Started',
    validate: {
      isIn: {
        args: [['Not Started', 'In Progress', 'Completed']],
        msg: 'Invalid status value',
      },
    },
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: { msg: 'Invalid start date' },
    },
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: { msg: 'Invalid end date' },
      isAfterStart(value) {
        if (value && this.startDate && new Date(value) < new Date(this.startDate)) {
          throw new Error('End date must be after start date');
        }
      },
    },
  },
}, {
  tableName: 'projects',
});

module.exports = Project;
