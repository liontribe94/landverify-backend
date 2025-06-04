const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  owner_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING
  },
  title_number: {
    type: DataTypes.STRING,
    unique: true
  },
  survey_plan_number: {
    type: DataTypes.STRING,
    unique: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  coordinates: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  },
  property_type: {
    type: DataTypes.STRING
  },
  size: {
    type: DataTypes.DECIMAL(10, 2)
  },
  price: {
    type: DataTypes.DECIMAL(15, 2)
  },
  description: {
    type: DataTypes.TEXT
  },
  images: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  documents: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of document objects with type, url, status, etc.'
  },
  verification_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'verified', 'rejected', 'flagged']]
    }
  },
  verification_details: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Details of verification process including history'
  },
  history_log: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  monitoring_alerts: {
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

module.exports = Property; 