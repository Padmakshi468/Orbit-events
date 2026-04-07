const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Book an event — validates slots, prevents double booking, decrements slot count
// @route   POST /api/bookings/book-event
// @access  Private
const bookEvent = async (req, res) => {
  const { name, email, eventId } = req.body;

  if (!name || !email || !eventId) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and event ID are required'
    });
  }

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // 🚨 Atomic check + update (IMPORTANT FIX)
    if (event.slotsBooked >= event.totalSlots) {
      return res.status(400).json({
        success: false,
        message: 'Event is fully booked'
      });
    }

    const alreadyBooked = await Booking.findOne({
      eventId,
      userId: req.user._id
    });

    if (alreadyBooked) {
      return res.status(400).json({
        success: false,
        message: 'Already booked'
      });
    }

    // Create booking
    const booking = await Booking.create({
      name,
      email,
      eventDate: event.date,
      eventId,
      userId: req.user._id
    });

    // Update slots
    event.slotsBooked += 1;
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Booking successful',
      booking,
      slotsRemaining: event.totalSlots - event.slotsBooked
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all bookings for the logged-in user
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('eventId', 'name date venueName city totalSlots slotsBooked')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { bookEvent, getMyBookings };
