const { sequelize } = require('../config/database');
const User = require('./user.model');
const Property = require('./property.model');
const Lead = require('./lead.model');
const Agent = require('./agent.model');
const Deal = require('./deal.model');
const Task = require('./task.model');
const Calendar = require('./calendar.model');

// User - Agent relationship (one-to-one)
User.hasOne(Agent, { foreignKey: 'user_id', as: 'agent_profile' });
Agent.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Agent - Lead relationship (one-to-many)
Agent.hasMany(Lead, { foreignKey: 'assigned_agent_id', as: 'leads' });
Lead.belongsTo(Agent, { foreignKey: 'assigned_agent_id', as: 'assigned_agent' });

// Property - User relationship (one-to-many, for property owners)
User.hasMany(Property, { foreignKey: 'owner_id', as: 'properties' });
Property.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Deal relationships
Deal.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });
Deal.belongsTo(Lead, { foreignKey: 'lead_id', as: 'lead' });
Deal.belongsTo(Agent, { foreignKey: 'agent_id', as: 'agent' });

Property.hasMany(Deal, { foreignKey: 'property_id', as: 'deals' });
Lead.hasMany(Deal, { foreignKey: 'lead_id', as: 'deals' });
Agent.hasMany(Deal, { foreignKey: 'agent_id', as: 'deals' });

// Task associations
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'assigned_by', as: 'assigner' });

// Calendar associations
Calendar.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = {
  sequelize,
  User,
  Property,
  Lead,
  Agent,
  Deal,
  Task,
  Calendar
}; 