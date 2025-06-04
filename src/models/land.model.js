const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user.model');

const Land = sequelize.define('Land', {
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
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  coordinates: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      hasLatLng(value) {
        if (!value.latitude || !value.longitude) {
          throw new Error('Coordinates must include latitude and longitude');
        }
      }
    }
  },
  area: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'pending', 'sold'),
    defaultValue: 'available'
  },
  documents: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: true
});

// Define relationship
Land.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasMany(Land, { as: 'lands', foreignKey: 'ownerId' });

module.exports = Land; 