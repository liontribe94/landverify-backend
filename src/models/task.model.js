const mongoose = require('mongoose');
const { Schema } = mongoose;

const taskSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  due_date: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assigned_to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assigned_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  related_to: {
    type: {
      model: {
        type: String,
        enum: ['Property', 'Lead', 'Deal']
      },
      id: {
        type: Schema.Types.ObjectId,
        refPath: 'related_to.model'
      }
    }
  },
  reminders: [{
    date: Date,
    message: String,
    sent: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Create indexes for common queries
taskSchema.index({ assigned_to: 1, status: 1 });
taskSchema.index({ due_date: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task; 