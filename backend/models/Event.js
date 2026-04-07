const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name:         { type: String, required: [true, 'Event name is required'], trim: true },
    description:  { type: String, trim: true },
    date:         { type: Date, required: [true, 'Event date is required'] },
    // Slot management
    totalSlots:   { type: Number, required: [true, 'Total slots required'], min: 1 },
    slotsBooked:  { type: Number, default: 0, min: 0 },
    
    

    // Venue & college details
    venueName:    { type: String, trim: true, default: '' },
    venueAddress: { type: String, trim: true, default: '' },
    city:         { type: String, trim: true, default: '' },
    collegeName:  { type: String, trim: true, default: '' },
    collegeWebsite: { type: String, trim: true, default: '' },
    organiserName:  { type: String, trim: true, default: '' },
    organiserEmail: { type: String, trim: true, default: '' },
    organiserPhone: { type: String, trim: true, default: '' },

    
   

    createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Virtual: remaining slots
eventSchema.virtual('slotsRemaining').get(function () {
  return Math.max(0, this.totalSlots - this.slotsBooked);
});

// Virtual: is sold out
eventSchema.virtual('soldOut').get(function () {
  return this.slotsBooked >= this.totalSlots;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
