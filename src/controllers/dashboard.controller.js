const { Deal, Lead, Property, Agent } = require('../models');
const { Op } = require('sequelize');

exports.getOverviewStats = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    // Get total counts
    const totalLeads = await Lead.count();
    const totalProperties = await Property.count();
    const totalDeals = await Deal.count();
    const totalAgents = await Agent.count();

    // Get recent leads
    const newLeads = await Lead.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // Get deals by stage
    const dealsByStage = await Deal.count({
      group: ['stage']
    });

    // Get total deal value
    const totalDealValue = await Deal.sum('value');

    // Get verification stats
    const verificationStats = await Property.count({
      group: ['verification_status']
    });

    // Get top performing agents
    const topAgents = await Agent.findAll({
      attributes: ['id', 'user_id'],
      include: [
        {
          model: Deal,
          as: 'deals',
          attributes: []
        }
      ],
      group: ['Agent.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('deals.id')), 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        total_stats: {
          leads: totalLeads,
          properties: totalProperties,
          deals: totalDeals,
          agents: totalAgents
        },
        recent_activity: {
          new_leads_30d: newLeads
        },
        deal_pipeline: dealsByStage,
        total_deal_value: totalDealValue,
        verification_stats: verificationStats,
        top_agents: topAgents
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

exports.getAgentPerformance = async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Get agent's deals
    const deals = await Deal.findAll({
      where: { agent_id: agent.id },
      attributes: [
        'stage',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('value')), 'total_value']
      ],
      group: ['stage']
    });

    // Get agent's leads
    const leads = await Lead.findAll({
      where: { assigned_agent_id: agent.id },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    res.json({
      success: true,
      data: {
        agent_details: agent,
        performance: {
          deals_by_stage: deals,
          leads_by_status: leads
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching agent performance',
      error: error.message
    });
  }
};

exports.getLeadAnalytics = async (req, res) => {
  try {
    // Get leads by source
    const leadsBySource = await Lead.count({
      group: ['source']
    });

    // Get leads by status
    const leadsByStatus = await Lead.count({
      group: ['status']
    });

    // Get conversion rates
    const totalLeads = await Lead.count();
    const convertedLeads = await Lead.count({
      where: {
        status: 'closed'
      }
    });

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    res.json({
      success: true,
      data: {
        leads_by_source: leadsBySource,
        leads_by_status: leadsByStatus,
        conversion_stats: {
          total_leads: totalLeads,
          converted_leads: convertedLeads,
          conversion_rate: conversionRate
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lead analytics',
      error: error.message
    });
  }
};

exports.getPropertyAnalytics = async (req, res) => {
  try {
    // Get properties by verification status
    const propertiesByStatus = await Property.count({
      group: ['verification_status']
    });

    // Get properties with deals
    const propertiesWithDeals = await Property.findAll({
      attributes: ['id', 'address'],
      include: [
        {
          model: Deal,
          as: 'deals',
          attributes: ['id', 'stage', 'value']
        }
      ],
      having: sequelize.literal('COUNT(deals.id) > 0'),
      group: ['Property.id']
    });

    res.json({
      success: true,
      data: {
        verification_stats: propertiesByStatus,
        properties_with_deals: propertiesWithDeals
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching property analytics',
      error: error.message
    });
  }
}; 