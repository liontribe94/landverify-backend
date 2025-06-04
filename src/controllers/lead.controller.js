const { Lead, Agent, Deal } = require('../models');

exports.getAllLeads = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.source) filters.source = req.query.source;
    if (req.query.assigned_agent_id) filters.assigned_agent_id = req.query.assigned_agent_id;

    // If user is an agent, only show their leads
    if (req.user.role === 'agent') {
      filters.assigned_agent_id = req.user.id;
    }

    const leads = await Lead.findAll({
      where: filters,
      include: [
        {
          model: Agent,
          as: 'assigned_agent',
          attributes: ['id', 'user_id']
        },
        {
          model: Deal,
          as: 'deals',
          attributes: ['id', 'stage', 'value', 'created_at']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: leads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leads',
      error: error.message
    });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [
        {
          model: Agent,
          as: 'assigned_agent',
          attributes: ['id', 'user_id']
        },
        {
          model: Deal,
          as: 'deals',
          attributes: ['id', 'stage', 'value', 'created_at']
        }
      ]
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check access permission
    if (req.user.role === 'agent' && lead.assigned_agent_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this lead'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lead',
      error: error.message
    });
  }
};

exports.createLead = async (req, res) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      status: 'new',
      communication_history: [{
        timestamp: new Date(),
        type: 'SYSTEM',
        message: 'Lead created in system'
      }]
    });

    res.status(201).json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating lead',
      error: error.message
    });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check access permission
    if (req.user.role === 'agent' && lead.assigned_agent_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }

    // Add to communication history if status changes
    if (req.body.status && req.body.status !== lead.status) {
      const currentHistory = lead.communication_history || [];
      const historyEntry = {
        timestamp: new Date(),
        type: 'STATUS_CHANGE',
        message: `Status updated from ${lead.status} to ${req.body.status}`,
        user_id: req.user.id
      };
      req.body.communication_history = [...currentHistory, historyEntry];
    }

    await lead.update(req.body);

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating lead',
      error: error.message
    });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Only admins can delete leads
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete leads'
      });
    }

    await lead.destroy();

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting lead',
      error: error.message
    });
  }
};

exports.addCommunication = async (req, res) => {
  try {
    const { type, message } = req.body;
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check access permission
    if (req.user.role === 'agent' && lead.assigned_agent_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }

    const communicationEntry = {
      timestamp: new Date(),
      type,
      message,
      user_id: req.user.id
    };

    const currentHistory = lead.communication_history || [];
    
    await lead.update({
      communication_history: [...currentHistory, communicationEntry]
    });

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding communication',
      error: error.message
    });
  }
};

exports.assignAgent = async (req, res) => {
  try {
    const { agent_id } = req.body;
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Only admins can assign agents
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign agents'
      });
    }

    const communicationEntry = {
      timestamp: new Date(),
      type: 'ASSIGNMENT',
      message: `Lead assigned to agent ID: ${agent_id}`,
      user_id: req.user.id
    };

    const currentHistory = lead.communication_history || [];

    await lead.update({
      assigned_agent_id: agent_id,
      communication_history: [...currentHistory, communicationEntry]
    });

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning agent',
      error: error.message
    });
  }
}; 