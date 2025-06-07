const mongoose = require('mongoose');
const { Schema } = mongoose;

const agentSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'User'
  },
  license_number: {
    type: String,
    unique: true
  },
  specializations: {
    type: [String],
    default: []
  },
  areas_served: {
    type: [String],
    default: []
  },
  bio: {
    type: String
  },
  profile_image: {
    type: String
  },
  performance_metrics: {
    total_deals: {
      type: Number,
      default: 0
    },
    deals_closed: {
      type: Number,
      default: 0
    },
    total_value: {
      type: Number,
      default: 0
    },
    lead_conversion_rate: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent; 