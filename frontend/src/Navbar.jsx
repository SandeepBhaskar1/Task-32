import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Use the location hook to determine the current path

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-blue-500">
            File Handler
          </Link>
          <div>
            {!isAuthenticated ? (
              <>
                {/* Conditionally render Login or Register links */}
                {location.pathname !== '/login' && (
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-blue-500 px-3 py-2"
                  >
                    Login
                  </Link>
                )}
                {location.pathname !== '/register' && (
                  <Link
                    to="/register"
                    className="text-gray-600 hover:text-blue-500 px-3 py-2"
                  >
                    Register
                  </Link>
                )}
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-blue-500 px-3 py-2"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
