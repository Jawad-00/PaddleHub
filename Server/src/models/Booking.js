const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTs: { type: Date, required: true },
  endTs: { type: Date, required: true },
  status: { type: String, enum: ['CONFIRMED','CANCELLED'], default: 'CONFIRMED' }
}, { timestamps: true });

// index to speed up overlap checks
bookingSchema.index({ courtId: 1, startTs: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
