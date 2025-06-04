const { Agent, User, Lead, Deal } = require('../models');

exports.getAllAgents = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;

    const agents = await Agent.findAll({
      where: filters,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        },
        {
          model: Lead,
          as: 'leads',
          attributes: ['id', 'name', 'status', 'created_at']
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
    const agent = await Agent.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        },
        {
          model: Lead,
          as: 'leads',
          attributes: ['id', 'name', 'status', 'created_at']
        },
        {
          model: Deal,
          as: 'deals',
          attributes: ['id', 'stage', 'value', 'created_at']
        }
      ]
    });

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
    // Only admins can create agents
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create agents'
      });
    }

    const agent = await Agent.create({
      ...req.body,
      performance_metrics: {
        total_deals: 0,
        deals_closed: 0,
        total_value: 0,
        lead_conversion_rate: 0
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
    const agent = await Agent.findByPk(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Agents can update their own profile, admins can update any agent
    if (req.user.role !== 'admin' && agent.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this agent'
      });
    }

    await agent.update(req.body);

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
    const agent = await Agent.findByPk(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Only admins can delete agents
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete agents'
      });
    }

    await agent.destroy();

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
    const agent = await Agent.findByPk(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Only admins can update performance metrics
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update performance metrics'
      });
    }

    const { performance_metrics } = req.body;
    await agent.update({ performance_metrics });

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