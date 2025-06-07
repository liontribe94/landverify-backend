const mongoose = require('mongoose');
const { Schema } = mongoose;

const propertySchema = new Schema({
  owner_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  phone: {
    type: String
  },
  title_number: {
    type: String,
    unique: true
  },
  survey_plan_number: {
    type: String,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  property_type: {
    type: String
  },
  size: {
    type: Number
  },
  price: {
    type: Number
  },
  description: {
    type: String
  },
  images: {
    type: [String],
    default: []
  },
  documents: {
    type: [{
      type: {
        type: String
      },
      url: String,
      status: String,
      uploaded_at: Date
    }],
    default: []
  },
  verification_status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'flagged'],
    default: 'pending'
  },
  verification_details: {
    type: Object,
    default: {}
  },
  history_log: {
    type: [{
      action: String,
      timestamp: Date,
      details: Object
    }],
    default: []
  },
  monitoring_alerts: {
    type: [{
      type: String,
      message: String,
      timestamp: Date
    }],
    default: []
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Index for geospatial queries
propertySchema.index({ coordinates: '2dsphere' });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property; 