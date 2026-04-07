const express = require('express');
const router = express.Router();
const { bookEvent, getMyBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/book-event', protect, bookEvent);
router.get('/my', protect, getMyBookings);

module.exports = router;
