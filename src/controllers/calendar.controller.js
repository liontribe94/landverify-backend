const { Calendar, User } = require('../models');

exports.getAllEvents = async (req, res) => {
  try {
    const { start_date, end_date, event_type } = req.query;
    const filters = {};

    if (event_type) filters.event_type = event_type;
    if (start_date && end_date) {
      filters.start_time = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      };
    }

    // If user is not admin, only show events they're involved in
    if (req.user.role !== 'admin') {
      filters.$or = [
        { created_by: req.user._id },
        { 'attendees.user': req.user._id }
      ];
    }

    const events = await Calendar.find(filters)
      .populate('created_by', 'first_name last_name email')
      .sort({ start_time: 1 });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching calendar events',
      error: error.message
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Calendar.findById(req.params.id)
      .populate('created_by', 'first_name last_name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check access permission
    if (req.user.role !== 'admin' && 
        event.created_by.toString() !== req.user._id.toString() && 
        !event.attendees.some(a => a.user.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this event'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = await Calendar.create({
      ...req.body,
      created_by: req.user._id
    });

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Calendar.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check access permission
    if (req.user.role !== 'admin' && event.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    await event.update(req.body);

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Calendar.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only admin or event creator can delete
    if (req.user.role !== 'admin' && event.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await event.destroy();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
};

exports.updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Calendar.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check access permission
    if (req.user.role !== 'admin' && 
        event.created_by !== req.user.id && 
        !event.attendees.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    await event.update({ status });

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating event status',
      error: error.message
    });
  }
}; 