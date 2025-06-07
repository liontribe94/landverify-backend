const { Property, User, Deal } = require('../models');

exports.getAllProperties = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.verification_status = req.query.status;
    if (req.query.owner_id) filters.owner_id = req.query.owner_id;

    const properties = await Property.find(filters)
      .populate('owner_id', 'first_name last_name email phone')
      .populate('deals', 'stage value created_at')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: error.message
    });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner_id', 'first_name last_name email phone')
      .populate('deals', 'stage value created_at');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching property',
      error: error.message
    });
  }
};

exports.createProperty = async (req, res) => {
  try {
    // Add initial entry to history_log
    const historyEntry = {
      timestamp: new Date(),
      action: 'PROPERTY_CREATED',
      user_id: req.user._id,
      details: 'Property listing created'
    };

    const property = await Property.create({
      ...req.body,
      owner_id: req.user._id,
      verification_status: 'pending',
      history_log: [historyEntry]
    });

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating property',
      error: error.message
    });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership or admin status
    if (property.owner_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    // Add to history_log
    const historyEntry = {
      timestamp: new Date(),
      action: 'PROPERTY_UPDATED',
      user_id: req.user._id,
      details: 'Property details updated',
      changes: req.body
    };

    property.set(req.body);
    property.history_log.push(historyEntry);
    await property.save();

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating property',
      error: error.message
    });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership or admin status
    if (property.owner_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    await property.deleteOne();

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting property',
      error: error.message
    });
  }
};

exports.updateVerificationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Only admins can update verification status
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update verification status'
      });
    }

    const historyEntry = {
      timestamp: new Date(),
      action: 'VERIFICATION_STATUS_UPDATED',
      user_id: req.user._id,
      details: `Verification status updated to ${status}`,
      notes: notes
    };

    property.verification_status = status;
    property.history_log.push(historyEntry);
    await property.save();

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating verification status',
      error: error.message
    });
  }
};

exports.verifyPropertyByDetails = async (req, res) => {
  try {
    const { title_number, survey_plan_number, coordinates } = req.body;

    if (!title_number && !survey_plan_number) {
      return res.status(400).json({
        success: false,
        message: 'Title number or survey plan number is required'
      });
    }

    // Build search query
    const searchQuery = {
      $or: []
    };

    if (title_number) {
      searchQuery.$or.push({ title_number });
    }

    if (survey_plan_number) {
      searchQuery.$or.push({ survey_plan_number });
    }

    const property = await Property.findOne(searchQuery)
      .populate('owner_id', 'first_name last_name email phone');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'No property found with the provided details'
      });
    }

    // Check coordinates if provided
    if (coordinates && coordinates.lat && coordinates.lng) {
      const propertyPoint = property.coordinates;
      if (propertyPoint) {
        const distance = calculateDistance(
          coordinates.lat,
          coordinates.lng,
          propertyPoint.coordinates[1],
          propertyPoint.coordinates[0]
        );

        // If coordinates are more than 100 meters apart, flag the verification
        if (distance > 100) {
          return res.json({
            success: true,
            data: {
              property,
              verification: {
                status: 'flagged',
                message: 'Property coordinates do not match the provided location',
                distance: Math.round(distance)
              }
            }
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        property,
        verification: {
          status: 'verified',
          message: 'Property details match the records'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying property',
      error: error.message
    });
  }
};

// Helper function to calculate distance between two points in meters
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

exports.uploadDocument = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership or admin status
    if (property.owner_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload documents for this property'
      });
    }

    const { document_type, document_name, document_url } = req.body;

    const newDocument = {
      type: document_type,
      name: document_name,
      url: document_url,
      uploaded_by: req.user._id,
      uploaded_at: new Date(),
      verification_status: 'pending'
    };

    const historyEntry = {
      timestamp: new Date(),
      action: 'DOCUMENT_UPLOADED',
      user_id: req.user._id,
      details: `New ${document_type} document uploaded: ${document_name}`
    };

    property.documents.push(newDocument);
    property.history_log.push(historyEntry);
    await property.save();

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

exports.verifyDocument = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Only admins can verify documents
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify documents'
      });
    }

    const { document_index, verification_status, notes } = req.body;

    if (!property.documents[document_index]) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update document verification status
    property.documents[document_index] = {
      ...property.documents[document_index],
      verification_status,
      verified_by: req.user._id,
      verified_at: new Date(),
      verification_notes: notes
    };

    // Add to history log
    const historyEntry = {
      timestamp: new Date(),
      action: 'DOCUMENT_VERIFIED',
      user_id: req.user._id,
      details: `Document ${property.documents[document_index].name} verified with status: ${verification_status}`,
      notes: notes
    };

    property.history_log.push(historyEntry);

    // Update property verification status if all documents are verified
    const allDocumentsVerified = property.documents.every(doc => doc.verification_status === 'verified');
    const anyDocumentRejected = property.documents.some(doc => doc.verification_status === 'rejected');

    if (allDocumentsVerified) {
      property.verification_status = 'verified';
    } else if (anyDocumentRejected) {
      property.verification_status = 'rejected';
    }

    await property.save();

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying document',
      error: error.message
    });
  }
}; 