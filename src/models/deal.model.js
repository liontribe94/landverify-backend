const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Deal = sequelize.define('Deal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  property_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  lead_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  agent_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  stage: {
    type: DataTypes.TEXT,
    defaultValue: 'new',
    validate: {
      isIn: [['new', 'contact_made', 'viewing_scheduled', 'negotiation', 'agreement', 'documentation', 'closed', 'cancelled']]
    }
  },
  deal_type: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isIn: [['sale', 'rent', 'lease']]
    }
  },
  value: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  commission: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  closing_date: {
    type: DataTypes.DATE
  },
  documents: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT
  },
  activity_log: {
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

module.exports = Deal; 