const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get all surveys for a user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.survey_id,
        s.schedule_time,
        s.status,
        s.notes,
        r.id as room_id,
        r.room_number,
        r.room_type
      FROM surveys s
      JOIN rooms r ON s.room_id = r.id
      WHERE s.user_id = $1
      ORDER BY s.schedule_time DESC
    `, [req.user.user_id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Schedule a new survey
router.post('/', auth, async (req, res) => {
  const { room_id, schedule_time, notes } = req.body;

  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if room exists
      const roomCheck = await client.query(
        'SELECT id FROM rooms WHERE id = $1',
        [room_id]
      );
      
      if (roomCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      // Create survey
      const survey = await client.query(
        'INSERT INTO surveys (room_id, user_id, schedule_time, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [room_id, req.user.user_id, schedule_time, 'pending', notes]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json(survey.rows[0]);
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

// Cancel survey
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if survey exists and belongs to user
      const survey = await client.query(
        'SELECT * FROM surveys WHERE survey_id = $1 AND user_id = $2',
        [id, req.user.user_id]
      );
      
      if (survey.rows.length === 0) {
        return res.status(404).json({ message: 'Survey not found' });
      }
      
      // Delete survey
      await client.query('DELETE FROM surveys WHERE survey_id = $1', [id]);
      
      await client.query('COMMIT');
      
      res.json({ message: 'Survey cancelled successfully' });
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