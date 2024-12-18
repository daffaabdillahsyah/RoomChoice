const bcrypt = require('bcryptjs');
const pool = require('../db');
require('dotenv').config();

async function createAdmin() {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Check if admin already exists
    const adminExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@roomchoice.com']
    );

    if (adminExists.rows.length > 0) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create admin user
    const newAdmin = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      ['admin', 'admin@roomchoice.com', hashedPassword, 'admin']
    );

    console.log('Admin created successfully');
    console.log('Email: admin@roomchoice.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin(); 