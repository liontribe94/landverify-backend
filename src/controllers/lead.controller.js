const Lead = require('../models/lead.model');

exports.getAllLeads = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.source) filters.source = req.query.source;

    // If user is an agent, only show their leads
    if (req.user.role === 'agent') {
      filters.assigned_agent = req.user._id;
    }

    const leads = await Lead.find(filters)
      .populate('assigned_agent', 'first_name last_name email')
      .sort({ created_at: -1 });

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
    const lead = await Lead.findById(req.params.id)
      .populate('assigned_agent', 'first_name last_name email')
      .populate('tasks')
      .populate('property_interest.property');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
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
      assigned_agent: req.user._id
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
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check access permission
    if (req.user.role === 'agent' && lead.assigned_agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }

    // Add to communication history if status changes
    if (req.body.status && req.body.status !== lead.status) {
      const historyEntry = {
        timestamp: new Date(),
        type: 'STATUS_CHANGE',
        message: `Status updated from ${lead.status} to ${req.body.status}`,
        user_id: req.user._id
      };
      lead.communication_history.push(historyEntry);
    }

    lead.set(req.body);
    await lead.save();

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
    const lead = await Lead.findById(req.params.id);

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

    await lead.deleteOne();

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
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check access permission
    if (req.user.role === 'agent' && lead.assigned_agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add communication to this lead'
      });
    }

    const communicationEntry = {
      ...req.body,
      timestamp: new Date(),
      user_id: req.user._id
    };

    lead.communication_history.push(communicationEntry);
    await lead.save();

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
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Only admins can assign leads
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign leads'
      });
    }

    lead.assigned_agent = req.body.agent_id;
    lead.communication_history.push({
      timestamp: new Date(),
      type: 'ASSIGNMENT',
      message: `Lead assigned to agent`,
      user_id: req.user._id
    });

    await lead.save();

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning lead',
      error: error.message
    });
  }
}; 