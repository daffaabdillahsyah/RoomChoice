import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RoomManagement from './pages/RoomManagement';
import RoomLayout from './pages/RoomLayout';
import MyBookings from './pages/MyBookings';
import Surveys from './pages/Surveys';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 w-full bg-gray-50">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/room-management" element={<RoomManagement />} />
              <Route path="/room-layout" element={<RoomLayout />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/surveys" element={<Surveys />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
