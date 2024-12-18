import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GRID_SIZE = 20; // 20x20 grid

const RoomLayout = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Status colors
  const statusColors = {
    available: 'bg-green-500',
    booked: 'bg-yellow-500',
    pending: 'bg-red-500'
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleRoomClick = (room) => {
    if (isAdmin) {
      setSelectedRoom(room);
      setIsEditing(true);
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/rooms/${selectedRoom.id}`, {
        ...selectedRoom,
        position_x: parseInt(selectedRoom.position_x),
        position_y: parseInt(selectedRoom.position_y)
      });
      setIsEditing(false);
      fetchRooms();
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const newRoom = {
        room_number: e.target.room_number.value,
        price: parseFloat(e.target.price.value),
        position_x: parseInt(e.target.position_x.value),
        position_y: parseInt(e.target.position_y.value)
      };
      await axios.post('/api/rooms', newRoom);
      fetchRooms();
      e.target.reset();
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Room Layout Management</h2>
      
      {/* Grid Layout */}
      <div className="border border-gray-300 w-[800px] h-[800px] relative mb-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => handleRoomClick(room)}
            className={`absolute cursor-pointer border-2 border-gray-600 flex items-center justify-center
              ${statusColors[room.status]} hover:opacity-80 transition-opacity`}
            style={{
              left: `${(room.position_x / GRID_SIZE) * 100}%`,
              top: `${(room.position_y / GRID_SIZE) * 100}%`,
              width: `${(room.width / GRID_SIZE) * 100}%`,
              height: `${(room.height / GRID_SIZE) * 100}%`,
            }}
          >
            <span className="text-white font-bold">{room.room_number}</span>
          </div>
        ))}
      </div>

      {/* Room Management Forms - Only visible to admin */}
      {isAdmin && (
        <div className="space-y-4">
          {/* Add Room Form */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Add New Room</h3>
            <form onSubmit={handleAddRoom} className="space-y-2">
              <input
                type="text"
                name="room_number"
                placeholder="Room Number"
                className="border p-2 rounded w-full"
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                className="border p-2 rounded w-full"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="position_x"
                  placeholder="Position X (0-19)"
                  className="border p-2 rounded"
                  min="0"
                  max="19"
                  required
                />
                <input
                  type="number"
                  name="position_y"
                  placeholder="Position Y (0-19)"
                  className="border p-2 rounded"
                  min="0"
                  max="19"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Room
              </button>
            </form>
          </div>

          {/* Edit Room Form */}
          {isEditing && selectedRoom && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Edit Room</h3>
              <form onSubmit={handleUpdateRoom} className="space-y-2">
                <select
                  value={selectedRoom.status}
                  onChange={(e) =>
                    setSelectedRoom({ ...selectedRoom, status: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="pending">Pending</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={selectedRoom.position_x}
                    onChange={(e) =>
                      setSelectedRoom({
                        ...selectedRoom,
                        position_x: e.target.value,
                      })
                    }
                    placeholder="Position X"
                    className="border p-2 rounded"
                    min="0"
                    max="19"
                  />
                  <input
                    type="number"
                    value={selectedRoom.position_y}
                    onChange={(e) =>
                      setSelectedRoom({
                        ...selectedRoom,
                        position_y: e.target.value,
                      })
                    }
                    placeholder="Position Y"
                    className="border p-2 rounded"
                    min="0"
                    max="19"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Room Status Legend:</h3>
        <div className="flex gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 mr-2"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 mr-2"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomLayout; 