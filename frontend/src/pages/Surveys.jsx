import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Surveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    room_id: '',
    schedule_time: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchSurveys();
    fetchRooms();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await axios.get(
        user?.role === 'admin' ? '/surveys' : '/surveys/my-surveys'
      );
      setSurveys(response.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setError('Failed to load surveys');
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('/surveys', formData);
      setSuccess('Survey scheduled successfully');
      setFormData({ room_id: '', schedule_time: '', notes: '' });
      fetchSurveys();
    } catch (error) {
      console.error('Error scheduling survey:', error);
      setError(error.response?.data?.message || 'Failed to schedule survey');
    }
  };

  const handleCancel = async (surveyId) => {
    try {
      await axios.patch(`/surveys/${surveyId}/cancel`);
      setSuccess('Survey cancelled successfully');
      fetchSurveys();
    } catch (error) {
      console.error('Error cancelling survey:', error);
      setError('Failed to cancel survey');
    }
  };

  const handleStatusUpdate = async (surveyId, status) => {
    try {
      await axios.patch(`/surveys/${surveyId}/status`, { status });
      setSuccess('Survey status updated successfully');
      fetchSurveys();
    } catch (error) {
      console.error('Error updating survey status:', error);
      setError('Failed to update survey status');
    }
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Room Surveys</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Survey Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Schedule a Survey</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="room_id" className="block text-gray-700 mb-2">
              Select Room
            </label>
            <select
              id="room_id"
              name="room_id"
              value={formData.room_id}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room.room_id} value={room.room_id}>
                  Room {room.room_number} - {room.room_type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="schedule_time" className="block text-gray-700 mb-2">
              Schedule Time
            </label>
            <input
              type="datetime-local"
              id="schedule_time"
              name="schedule_time"
              value={formData.schedule_time}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input"
              rows="3"
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary">
            Schedule Survey
          </button>
        </form>
      </div>

      {/* Surveys List */}
      <div className="grid gap-6">
        {surveys.map((survey) => (
          <div
            key={survey.survey_id}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Room {survey.room_number}
                </h3>
                <p className="text-gray-600">
                  Scheduled for: {formatDateTime(survey.schedule_time)}
                </p>
                {survey.notes && (
                  <p className="text-gray-600 mt-2">Notes: {survey.notes}</p>
                )}
                <p className="mt-2">
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                      survey.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : survey.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                  </span>
                </p>
              </div>

              <div className="space-x-2">
                {user?.role === 'admin' && survey.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(survey.survey_id, 'completed')}
                      className="btn btn-primary"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(survey.survey_id, 'cancelled')}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {!user?.role === 'admin' && survey.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(survey.survey_id)}
                    className="btn btn-secondary"
                  >
                    Cancel Survey
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {surveys.length === 0 && (
          <p className="text-gray-500 text-center">No surveys found</p>
        )}
      </div>
    </div>
  );
};

export default Surveys; 