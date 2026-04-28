import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-blue-600">
        Smart-Rent
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600">Halo, {user.name}</span>
            {user.role === 'user' && (
              <Link
                to="/my-rentals"
                className="text-sm text-gray-600 hover:text-blue-500"
              >
                Sewa Saya
              </Link>
            )}
            {user.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="text-sm text-gray-600 hover:text-blue-500"
              >
                Dashboard
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm bg-red-50 text-red-500 px-3 py-1 rounded-lg hover:bg-red-100 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-blue-500"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
            >
              Daftar
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
