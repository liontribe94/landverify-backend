const { Deal, Lead, Property, Agent } = require('../models');

exports.getOverviewStats = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    // Get total counts
    const totalLeads = await Lead.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalDeals = await Deal.countDocuments();
    const totalAgents = await Agent.countDocuments();

    // Get recent leads
    const newLeads = await Lead.countDocuments({
      created_at: {
        $gte: thirtyDaysAgo
      }
    });

    // Get deals by stage
    const dealsByStage = await Deal.aggregate([
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total deal value
    const totalDealValue = await Deal.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$value' }
        }
      }
    ]).then(result => result[0]?.total || 0);

    // Get verification stats
    const verificationStats = await Property.aggregate([
      {
        $group: {
          _id: '$verification_status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top performing agents
    const topAgents = await Deal.aggregate([
      {
        $group: {
          _id: '$agent',
          total_deals: { $sum: 1 },
          total_value: { $sum: '$value' }
        }
      },
      {
        $sort: { total_deals: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'agents',
          localField: '_id',
          foreignField: '_id',
          as: 'agent_details'
        }
      }
    ]);

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
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Get agent's deals
    const deals = await Deal.aggregate([
      {
        $match: { agent: agent._id }
      },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          total_value: { $sum: '$value' }
        }
      }
    ]);

    // Get agent's leads
    const leads = await Lead.aggregate([
      {
        $match: { assigned_agent: agent._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

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
    const leadsBySource = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get leads by status
    const leadsByStatus = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get conversion rates
    const totalLeads = await Lead.countDocuments();
    const convertedLeads = await Lead.countDocuments({
      status: 'closed'
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
    const propertiesByStatus = await Property.aggregate([
      {
        $group: {
          _id: '$verification_status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get properties with deals
    const propertiesWithDeals = await Property.aggregate([
      {
        $lookup: {
          from: 'deals',
          localField: '_id',
          foreignField: 'property',
          as: 'deals'
        }
      },
      {
        $match: {
          'deals.0': { $exists: true }
        }
      },
      {
        $project: {
          _id: 1,
          address: 1,
          deals: {
            _id: 1,
            stage: 1,
            value: 1
          }
        }
      }
    ]);

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