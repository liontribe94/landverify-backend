const Land = require('../models/land.model');

exports.getAllLands = async (req, res) => {
  try {
    const lands = await Land.findAll({
      include: ['owner']
    });
    
    res.json({
      success: true,
      data: lands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lands',
      error: error.message
    });
  }
};

exports.getLandById = async (req, res) => {
  try {
    const land = await Land.findByPk(req.params.id, {
      include: ['owner']
    });

    if (!land) {
      return res.status(404).json({
        success: false,
        message: 'Land not found'
      });
    }

    res.json({
      success: true,
      data: land
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching land',
      error: error.message
    });
  }
};

exports.createLand = async (req, res) => {
  try {
    const land = await Land.create({
      ...req.body,
      ownerId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: land
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating land',
      error: error.message
    });
  }
};

exports.updateLand = async (req, res) => {
  try {
    const land = await Land.findByPk(req.params.id);

    if (!land) {
      return res.status(404).json({
        success: false,
        message: 'Land not found'
      });
    }

    if (land.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this land'
      });
    }

    await land.update(req.body);

    res.json({
      success: true,
      data: land
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating land',
      error: error.message
    });
  }
};

exports.deleteLand = async (req, res) => {
  try {
    const land = await Land.findByPk(req.params.id);

    if (!land) {
      return res.status(404).json({
        success: false,
        message: 'Land not found'
      });
    }

    if (land.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this land'
      });
    }

    await land.destroy();

    res.json({
      success: true,
      message: 'Land deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting land',
      error: error.message
    });
  }
}; 