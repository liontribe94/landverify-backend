const mongoose = require('mongoose');
const { Schema } = mongoose;

const calendarSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  start_time: {
    type: Date,
    required: true
  },
  end_time: {
    type: Date,
    required: true
  },
  event_type: {
    type: String,
    enum: ['meeting', 'viewing', 'inspection', 'follow_up', 'other']
  },
  location: {
    type: String
  },
  attendees: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  related_to: {
    model: {
      type: String,
      enum: ['Property', 'Lead', 'Deal', 'Task']
    },
    id: {
      type: Schema.Types.ObjectId,
      refPath: 'related_to.model'
    }
  },
  reminders: [{
    time: Date,
    type: {
      type: String,
      enum: ['email', 'sms', 'push'],
      default: 'email'
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Create indexes for common queries
calendarSchema.index({ start_time: 1, end_time: 1 });
calendarSchema.index({ created_by: 1 });
calendarSchema.index({ 'attendees.user': 1 });

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar; 