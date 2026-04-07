const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add new event (with venue, college, image)
// @route   POST /api/events
// @access  Private
const addEvent = async (req, res) => {
  const {
    name, description, date,
    
    venueName, venueAddress, city,
    collegeName, collegeWebsite,
    organiserName, organiserEmail, organiserPhone,
    totalSlots,
  } = req.body;

  if (!name || !date || !totalSlots) {
    return res.status(400).json({ success: false, message: 'Event name, date and total slots are required' });
  }
  if (isNaN(totalSlots) || Number(totalSlots) < 1) {
    return res.status(400).json({ success: false, message: 'Total slots must be at least 1' });
  }

  try {
    const event = await Event.create({
      name, description, date,
      venueName, venueAddress, city,
      collegeName, collegeWebsite,
      organiserName, organiserEmail, organiserPhone,
      totalSlots: Number(totalSlots),
      slotsBooked: 0,
      createdBy: req.user?._id,
    });
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getEvents, getEventById, addEvent, deleteEvent };
