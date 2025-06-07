const { Deal, Property, Lead } = require('../models');

exports.getAllDeals = async (req, res) => {
  try {
    const filters = {};
    if (req.query.stage) filters.stage = req.query.stage;
    if (req.query.deal_type) filters.deal_type = req.query.deal_type;

    // If user is an agent, only show their deals
    if (req.user.role === 'agent') {
      filters.agent = req.user._id;
    }

    const deals = await Deal.find(filters)
      .populate('property', 'address verification_status')
      .populate('lead', 'first_name last_name email phone')
      .populate('agent', 'first_name last_name email')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: deals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching deals',
      error: error.message
    });
  }
};

exports.getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('property', 'address verification_status')
      .populate('lead', 'first_name last_name email phone')
      .populate('agent', 'first_name last_name email');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    res.json({
      success: true,
      data: deal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching deal',
      error: error.message
    });
  }
};

exports.createDeal = async (req, res) => {
  try {
    // Verify property exists
    const property = await Property.findById(req.body.property);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Verify lead exists
    const lead = await Lead.findById(req.body.lead);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const deal = await Deal.create({
      ...req.body,
      agent: req.user._id,
      activity_log: [{
        action: 'DEAL_CREATED',
        timestamp: new Date(),
        details: 'New deal created',
        user_id: req.user._id
      }]
    });

    res.status(201).json({
      success: true,
      data: deal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating deal',
      error: error.message
    });
  }
};

exports.updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check if user is admin or the assigned agent
    if (req.user.role !== 'admin' && deal.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this deal'
      });
    }

    // Add activity log entry
    const activityEntry = {
      action: 'DEAL_UPDATED',
      timestamp: new Date(),
      details: 'Deal details updated',
      user_id: req.user._id,
      changes: req.body
    };

    deal.set(req.body);
    deal.activity_log.push(activityEntry);
    await deal.save();

    res.json({
      success: true,
      data: deal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating deal',
      error: error.message
    });
  }
};

exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Only admin can delete deals
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete deals'
      });
    }

    await deal.deleteOne();

    res.json({
      success: true,
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting deal',
      error: error.message
    });
  }
};

exports.updateDealStage = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check if user is admin or the assigned agent
    if (req.user.role !== 'admin' && deal.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this deal'
      });
    }

    const activityEntry = {
      action: 'STAGE_UPDATED',
      timestamp: new Date(),
      details: `Deal stage updated from ${deal.stage} to ${req.body.stage}`,
      user_id: req.user._id
    };

    deal.stage = req.body.stage;
    deal.activity_log.push(activityEntry);
    await deal.save();

    res.json({
      success: true,
      data: deal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating deal stage',
      error: error.message
    });
  }
};

exports.addDocument = async (req, res) => {
  try {
    const { document_url, document_type, notes } = req.body;
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check access permission
    if (req.user.role === 'agent' && deal.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this deal'
      });
    }

    const document = {
      url: document_url,
      type: document_type,
      notes: notes,
      uploaded_at: new Date(),
      uploaded_by: req.user._id
    };

    const activityEntry = {
      timestamp: new Date(),
      action: 'DOCUMENT_ADDED',
      user_id: req.user._id,
      details: `New ${document_type} document added`
    };

    deal.documents.push(document);
    deal.activity_log.push(activityEntry);
    await deal.save();

    res.json({
      success: true,
      data: deal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding document',
      error: error.message
    });
  }
}; 