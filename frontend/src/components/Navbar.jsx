import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-blue-600 text-white">
      <div className="w-full mx-auto">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold">
                RoomChoice
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              {user ? (
                <>
                  <Link to="/" className="nav-link">
                    Dashboard
                  </Link>
                  
                  {user.role === 'admin' && (
                    <>
                      <Link to="/room-management" className="nav-link">
                        Room Management
                      </Link>
                      <Link to="/room-layout" className="nav-link">
                        Room Layout
                      </Link>
                    </>
                  )}
                  
                  <Link to="/my-bookings" className="nav-link">
                    My Bookings
                  </Link>
                  <Link to="/surveys" className="nav-link">
                    Surveys
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="ml-4 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`${
              isMenuOpen ? 'block' : 'hidden'
            } lg:hidden absolute top-16 left-0 right-0 bg-blue-600 shadow-lg z-50`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  <Link
                    to="/"
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  {user.role === 'admin' && (
                    <>
                      <Link
                        to="/room-management"
                        className="mobile-nav-link"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Room Management
                      </Link>
                      <Link
                        to="/room-layout"
                        className="mobile-nav-link"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Room Layout
                      </Link>
                    </>
                  )}
                  
                  <Link
                    to="/my-bookings"
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/surveys"
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Surveys
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left mobile-nav-link text-red-200 hover:text-white hover:bg-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="mobile-nav-link bg-white text-blue-600 hover:bg-blue-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 