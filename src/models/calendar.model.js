const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Calendar = sequelize.define('Calendar', {
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
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  event_type: {
    type: DataTypes.STRING,
    validate: {
      isIn: [['meeting', 'viewing', 'inspection', 'follow_up', 'other']]
    }
  },
  location: {
    type: DataTypes.STRING
  },
  attendees: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  related_to: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Can link to property, lead, deal, or task'
  },
  reminders: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'scheduled',
    validate: {
      isIn: [['scheduled', 'in_progress', 'completed', 'cancelled']]
    }
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

module.exports = Calendar; 