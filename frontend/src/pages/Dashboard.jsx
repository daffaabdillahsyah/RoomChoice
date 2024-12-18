import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDates, setBookingDates] = useState({
    start_date: '',
    end_date: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/rooms');
      setRooms(response.data || []);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms. Please try again later.');
      setLoading(false);
    }
  };

  const handleBookRoom = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return;

    try {
      await axios.post('/bookings', {
        room_id: selectedRoom.id,
        start_date: bookingDates.start_date,
        end_date: bookingDates.end_date
      });
      
      setSelectedRoom(null);
      setBookingDates({ start_date: '', end_date: '' });
      fetchRooms();
      setError(null);
    } catch (err) {
      console.error('Error booking room:', err);
      setError(err.response?.data?.message || 'Failed to book room. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Room Availability</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Room List */}
        <div className="lg:col-span-2">
          {rooms.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              No rooms available at the moment.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedRoom?.id === room.id
                        ? 'border-blue-500 shadow-md'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{room.room_number}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${room.status === 'available' ? 'bg-green-100 text-green-800' :
                          room.status === 'booked' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}>
                        {room.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{room.room_type}</p>
                    <p className="text-lg font-medium text-gray-900">${room.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Book a Room</h2>
            {user ? (
              selectedRoom ? (
                <form onSubmit={handleBookRoom} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Room
                    </label>
                    <div className="bg-gray-50 px-4 py-2 rounded-md">
                      {selectedRoom.room_number} - {selectedRoom.room_type}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={bookingDates.start_date}
                      onChange={(e) =>
                        setBookingDates({ ...bookingDates, start_date: e.target.value })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={bookingDates.end_date}
                      onChange={(e) =>
                        setBookingDates({ ...bookingDates, end_date: e.target.value })
                      }
                      min={bookingDates.start_date || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                    disabled={selectedRoom.status !== 'available'}
                  >
                    Book Now
                  </button>
                </form>
              ) : (
                <p className="text-gray-600 text-center">Please select an available room to book</p>
              )
            ) : (
              <p className="text-gray-600 text-center">Please login to book a room</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 