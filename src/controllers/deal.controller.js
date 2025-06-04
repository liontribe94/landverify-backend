const { Deal, Property, Lead, Agent } = require('../models');

exports.getAllDeals = async (req, res) => {
  try {
    const filters = {};
    if (req.query.stage) filters.stage = req.query.stage;
    if (req.query.deal_type) filters.deal_type = req.query.deal_type;

    // If user is an agent, only show their deals
    if (req.user.role === 'agent') {
      filters.agent_id = req.user.id;
    }

    const deals = await Deal.findAll({
      where: filters,
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'address', 'verification_status']
        },
        {
          model: Lead,
          as: 'lead',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'user_id']
        }
      ],
      order: [['created_at', 'DESC']]
    });

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
    const deal = await Deal.findByPk(req.params.id, {
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'address', 'verification_status']
        },
        {
          model: Lead,
          as: 'lead',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'user_id']
        }
      ]
    });

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check access permission
    if (req.user.role === 'agent' && deal.agent_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this deal'
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
    const property = await Property.findByPk(req.body.property_id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Verify lead exists
    const lead = await Lead.findByPk(req.body.lead_id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const deal = await Deal.create({
      ...req.body,
      stage: 'new',
      activity_log: [{
        timestamp: new Date(),
        action: 'DEAL_CREATED',
        user_id: req.user.id,
        details: 'New deal created'
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
    const deal = await Deal.findByPk(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check access permission
    if (req.user.role === 'agent' && deal.agent_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this deal'
      });
    }

    // Add to activity log if stage changes
    if (req.body.stage && req.body.stage !== deal.stage) {
      const activityEntry = {
        timestamp: new Date(),
        action: 'STAGE_UPDATED',
        user_id: req.user.id,
        details: `Stage updated from ${deal.stage} to ${req.body.stage}`
      };

      const currentLog = deal.activity_log || [];
      req.body.activity_log = [...currentLog, activityEntry];
    }

    await deal.update(req.body);

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
    const deal = await Deal.findByPk(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Only admins can delete deals
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete deals'
      });
    }

    await deal.destroy();

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

exports.addDocument = async (req, res) => {
  try {
    const { document_url, document_type, notes } = req.body;
    const deal = await Deal.findByPk(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check access permission
    if (req.user.role === 'agent' && deal.agent_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this deal'
      });
    }

    const documentEntry = {
      url: document_url,
      type: document_type,
      notes: notes,
      uploaded_at: new Date(),
      uploaded_by: req.user.id
    };

    const currentDocs = deal.documents || [];
    
    await deal.update({
      documents: [...currentDocs, documentEntry]
    });

    // Add to activity log
    const activityEntry = {
      timestamp: new Date(),
      action: 'DOCUMENT_ADDED',
      user_id: req.user.id,
      details: `New ${document_type} document added`
    };

    const currentLog = deal.activity_log || [];
    
    await deal.update({
      activity_log: [...currentLog, activityEntry]
    });

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