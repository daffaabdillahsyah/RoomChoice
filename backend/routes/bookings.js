const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get all bookings for a user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.booking_id,
        b.start_date,
        b.end_date,
        b.status,
        r.id as room_id,
        r.room_number,
        r.room_type,
        r.price
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [req.user.user_id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new booking
router.post('/', auth, async (req, res) => {
  const { room_id, start_date, end_date } = req.body;

  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if room exists and is available
      const roomCheck = await client.query(
        'SELECT status FROM rooms WHERE id = $1',
        [room_id]
      );
      
      if (roomCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      if (roomCheck.rows[0].status !== 'available') {
        return res.status(400).json({ message: 'Room is not available' });
      }
      
      // Create booking
      const booking = await client.query(
        'INSERT INTO bookings (room_id, user_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [room_id, req.user.user_id, start_date, end_date, 'pending']
      );
      
      // Update room status
      await client.query(
        'UPDATE rooms SET status = $1 WHERE id = $2',
        ['pending', room_id]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json(booking.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get booking and check ownership
      const booking = await client.query(
        'SELECT * FROM bookings WHERE booking_id = $1 AND user_id = $2',
        [id, req.user.user_id]
      );
      
      if (booking.rows.length === 0) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Update room status back to available
      await client.query(
        'UPDATE rooms SET status = $1 WHERE id = $2',
        ['available', booking.rows[0].room_id]
      );
      
      // Delete booking
      await client.query('DELETE FROM bookings WHERE booking_id = $1', [id]);
      
      await client.query('COMMIT');
      
      res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 