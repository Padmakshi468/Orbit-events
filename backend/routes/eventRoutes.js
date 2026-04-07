const express = require('express');
const router = express.Router();
const { getEvents, getEventById, addEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getEvents);
router.get('/:id', protect, getEventById);
router.post('/', protect, addEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
