const mongoose = require('mongoose');
const { Schema } = mongoose;

const landSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    type: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },
    required: true,
    validate: {
      validator: function(value) {
        return value.latitude && value.longitude;
      },
      message: 'Coordinates must include latitude and longitude'
    }
  },
  area: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold'],
    default: 'available'
  },
  documents: {
    type: [String],
    default: []
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create index for geospatial queries if needed
landSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

const Land = mongoose.model('Land', landSchema);

module.exports = Land; 