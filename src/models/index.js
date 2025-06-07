const User = require('./user.model');
const Property = require('./property.model');
const Lead = require('./lead.model');
const Agent = require('./agent.model');
const Deal = require('./deal.model');
const Task = require('./task.model');
const Calendar = require('./calendar.model');

// Export all models
module.exports = {
  User,
  Property,
  Lead,
  Agent,
  Deal,
  Task,
  Calendar
}; 