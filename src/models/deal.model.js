const mongoose = require('mongoose');
const { Schema } = mongoose;

const dealSchema = new Schema({
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  lead: {
    type: Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  agent: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stage: {
    type: String,
    enum: ['new', 'contact_made', 'viewing_scheduled', 'negotiation', 'agreement', 'documentation', 'closed', 'cancelled'],
    default: 'new'
  },
  deal_type: {
    type: String,
    enum: ['sale', 'rent', 'lease'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  commission: {
    type: Number,
    required: true
  },
  closing_date: {
    type: Date
  },
  documents: [{
    type: {
      type: String
    },
    url: String,
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String
  },
  activity_log: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: Object
  }]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Create indexes for common queries
dealSchema.index({ agent: 1, stage: 1 });
dealSchema.index({ property: 1 });
dealSchema.index({ lead: 1 });

const Deal = mongoose.model('Deal', dealSchema);

module.exports = Deal; 