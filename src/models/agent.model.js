const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Agent = sequelize.define('Agent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  license_number: {
    type: DataTypes.TEXT,
    unique: true
  },
  specializations: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  areas_served: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  bio: {
    type: DataTypes.TEXT
  },
  profile_image: {
    type: DataTypes.TEXT
  },
  performance_metrics: {
    type: DataTypes.JSONB,
    defaultValue: {
      total_deals: 0,
      deals_closed: 0,
      total_value: 0,
      lead_conversion_rate: 0
    }
  },
  status: {
    type: DataTypes.TEXT,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'inactive', 'suspended']]
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

module.exports = Agent; 