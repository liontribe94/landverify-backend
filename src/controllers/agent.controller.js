const Agent = require('../models/agent.model');

exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find()
      .populate('user', 'first_name last_name email')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: agents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching agents',
      error: error.message
    });
  }
};

exports.getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id)
      .populate('user', 'first_name last_name email')
      .populate('leads')
      .populate('deals');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching agent',
      error: error.message
    });
  }
};

exports.createAgent = async (req, res) => {
  try {
    const agent = await Agent.create({
      ...req.body,
      performance_metrics: {
        deals_closed: 0,
        revenue_generated: 0,
        client_satisfaction: 0,
        response_time: 0
      }
    });

    res.status(201).json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating agent',
      error: error.message
    });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Only admin or the agent themselves can update
    if (req.user.role !== 'admin' && agent.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this agent'
      });
    }

    agent.set(req.body);
    await agent.save();

    res.json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating agent',
      error: error.message
    });
  }
};

exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Only admin can delete agents
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete agents'
      });
    }

    await agent.deleteOne();

    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting agent',
      error: error.message
    });
  }
};

exports.updatePerformanceMetrics = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Only admin can update performance metrics
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update performance metrics'
      });
    }

    agent.performance_metrics = {
      ...agent.performance_metrics,
      ...req.body
    };
    await agent.save();

    res.json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating performance metrics',
      error: error.message
    });
  }
}; 