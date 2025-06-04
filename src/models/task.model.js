const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  due_date: {
    type: DataTypes.DATE
  },
  priority: {
    type: DataTypes.STRING,
    validate: {
      isIn: [['low', 'medium', 'high']]
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'in_progress', 'completed', 'cancelled']]
    }
  },
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: false
  },
  assigned_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  related_to: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Can link to property, lead, or deal'
  },
  reminders: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Task; 