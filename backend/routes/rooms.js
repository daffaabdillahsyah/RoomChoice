const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all rooms with their layout information
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.room_number,
        r.status,
        r.price,
        r.created_at,
        rl.position_x,
        rl.position_y,
        rl.width,
        rl.height
      FROM rooms r 
      LEFT JOIN room_layouts rl ON r.id = rl.room_id
      ORDER BY r.room_number
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new room (admin only)
router.post('/', admin, async (req, res) => {
  const { room_number, room_type, price, position_x, position_y, description } = req.body;

  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert room
      const roomResult = await client.query(
        'INSERT INTO rooms (room_number, room_type, status, price, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [room_number, room_type, 'available', price, description]
      );
      
      const roomId = roomResult.rows[0].id;
      
      // Insert room layout if position is provided
      if (position_x !== undefined && position_y !== undefined) {
        await client.query(
          'INSERT INTO room_layouts (room_id, position_x, position_y) VALUES ($1, $2, $3)',
          [roomId, position_x, position_y]
        );
      }
      
      await client.query('COMMIT');
      
      res.status(201).json({ message: 'Room created successfully', roomId });
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

// Update room details (admin only)
router.put('/:id', admin, async (req, res) => {
  const { id } = req.params;
  const { room_number, room_type, price, status, position_x, position_y, description } = req.body;

  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update room
      if (room_number || room_type || price || status || description) {
        const updates = [];
        const values = [id];
        let valueIndex = 2;
        
        if (room_number) {
          updates.push(`room_number = $${valueIndex}`);
          values.push(room_number);
          valueIndex++;
        }
        if (room_type) {
          updates.push(`room_type = $${valueIndex}`);
          values.push(room_type);
          valueIndex++;
        }
        if (price) {
          updates.push(`price = $${valueIndex}`);
          values.push(price);
          valueIndex++;
        }
        if (status) {
          updates.push(`status = $${valueIndex}`);
          values.push(status);
          valueIndex++;
        }
        if (description) {
          updates.push(`description = $${valueIndex}`);
          values.push(description);
          valueIndex++;
        }
        
        if (updates.length > 0) {
          await client.query(
            `UPDATE rooms SET ${updates.join(', ')} WHERE id = $1`,
            values
          );
        }
      }
      
      // Update room layout
      if (position_x !== undefined || position_y !== undefined) {
        // Check if layout exists
        const layoutExists = await client.query(
          'SELECT id FROM room_layouts WHERE room_id = $1',
          [id]
        );
        
        if (layoutExists.rows.length > 0) {
          // Update existing layout
          const updates = [];
          const values = [id];
          let valueIndex = 2;
          
          if (position_x !== undefined) {
            updates.push(`position_x = $${valueIndex}`);
            values.push(position_x);
            valueIndex++;
          }
          if (position_y !== undefined) {
            updates.push(`position_y = $${valueIndex}`);
            values.push(position_y);
            valueIndex++;
          }
          
          await client.query(
            `UPDATE room_layouts SET ${updates.join(', ')} WHERE room_id = $1`,
            values
          );
        } else {
          // Insert new layout
          await client.query(
            'INSERT INTO room_layouts (room_id, position_x, position_y) VALUES ($1, $2, $3)',
            [id, position_x || 0, position_y || 0]
          );
        }
      }
      
      await client.query('COMMIT');
      
      res.json({ message: 'Room updated successfully' });
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

// Delete room (admin only)
router.delete('/:id', admin, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM rooms WHERE id = $1', [id]);
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 