const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  source: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isIn: [['facebook', 'referral', 'website', 'direct', 'other']]
    }
  },
  status: {
    type: DataTypes.TEXT,
    defaultValue: 'new',
    validate: {
      isIn: [['new', 'contacted', 'scheduled_visit', 'negotiating', 'closed', 'lost']]
    }
  },
  property_interest: {
    type: DataTypes.JSONB,
    defaultValue: {
      type: [],
      location: [],
      price_range: {}
    }
  },
  assigned_agent_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT
  },
  communication_history: {
    type: DataTypes.JSONB,
    defaultValue: []
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

module.exports = Lead; 