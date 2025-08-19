const mongoose = require('mongoose');

const openingHourSchema = new mongoose.Schema({
  weekday: { type: Number, min:0, max:6 },
  openTime: { type: String }, // "08:00"
  closeTime: { type: String } // "22:00"
}, { _id: false });

const courtSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  city: { type: String, index: true, lowercase: true },
  address: String,
  pricePerHour: Number,
  surfaceType: String,
  indoor: Boolean,
  amenities: { lights: Boolean, parking: Boolean, locker: Boolean },
  images: [String],
  openingHours: [openingHourSchema],
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Court', courtSchema);
