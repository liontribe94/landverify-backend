const Calendar = require('../models/calendar.model');

exports.getAllEvents = async (req, res) => {
  try {
    const filters = {};
    if (req.query.event_type) filters.event_type = req.query.event_type;
    if (req.query.start_date && req.query.end_date) {
      filters.start_time = {
        $gte: new Date(req.query.start_date),
        $lte: new Date(req.query.end_date)
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
      .populate('attendees.user', 'first_name last_name email')
      .sort({ start_time: 1 });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Calendar.findById(req.params.id)
      .populate('created_by', 'first_name last_name email')
      .populate('attendees.user', 'first_name last_name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
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
      created_by: req.user._id,
      status: 'scheduled'
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
    const event = await Calendar.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is admin or event creator
    if (req.user.role !== 'admin' && event.created_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    event.set(req.body);
    await event.save();

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
    const event = await Calendar.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is admin or event creator
    if (req.user.role !== 'admin' && event.created_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await event.deleteOne();

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
    const event = await Calendar.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is admin, event creator, or an attendee
    const isAttendee = event.attendees.some(a => a.user.toString() === req.user._id.toString());
    if (req.user.role !== 'admin' && 
        event.created_by.toString() !== req.user._id.toString() && 
        !isAttendee) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update event status'
      });
    }

    event.status = req.body.status;
    await event.save();

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