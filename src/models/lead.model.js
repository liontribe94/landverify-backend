const mongoose = require('mongoose');
const { Schema } = mongoose;

const leadSchema = new Schema({
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'direct', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
    default: 'new'
  },
  assigned_agent: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  property_interest: [{
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property'
    },
    interest_level: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    notes: String
  }],
  requirements: {
    budget: {
      min: Number,
      max: Number
    },
    property_type: [String],
    preferred_locations: [String],
    bedrooms: Number,
    bathrooms: Number,
    other_preferences: Object
  },
  communication_history: [{
    type: {
      type: String,
      enum: ['email', 'call', 'meeting', 'message']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String,
    outcome: String
  }],
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  documents: [{
    title: String,
    url: String,
    type: String,
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: String,
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Create indexes for common queries
leadSchema.index({ assigned_agent: 1, status: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ 'property_interest.property': 1 });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;