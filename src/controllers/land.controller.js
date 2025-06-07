const Land = require('../models/land.model');

exports.getAllLands = async (req, res) => {
  try {
    const lands = await Land.find()
      .populate('owner', 'first_name last_name email')
      .sort({ created_at: -1 });

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
    const land = await Land.findById(req.params.id)
      .populate('owner', 'first_name last_name email');

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
      owner: req.user._id
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
    const land = await Land.findById(req.params.id);

    if (!land) {
      return res.status(404).json({
        success: false,
        message: 'Land not found'
      });
    }

    // Check ownership or admin status
    if (land.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this land'
      });
    }

    land.set(req.body);
    await land.save();

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
    const land = await Land.findById(req.params.id);

    if (!land) {
      return res.status(404).json({
        success: false,
        message: 'Land not found'
      });
    }

    // Check ownership or admin status
    if (land.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this land'
      });
    }

    await land.deleteOne();

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