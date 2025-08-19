require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const connectDB = require('./db');

(async () => {
  await connectDB();
  const adminEmail = 'admin@paddle.app';
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const hash = await bcrypt.hash('Admin1234', 12);
    await User.create({ role: 'ADMIN', name: 'Admin', email: adminEmail, passwordHash: hash });
    console.log('Admin user created:', adminEmail, 'password: Admin1234');
  } else {
    console.log('Admin already exists');
  }
  process.exit(0);
})();
