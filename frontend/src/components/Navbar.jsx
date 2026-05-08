import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import logo from '../../public/image/logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={user?.role === 'admin' ? '/admin/dashboard' : '/'}
            className="flex items-center gap-2.5"
          >
            <img src={logo} alt="Logo" className="h-20 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {user?.role === 'user' && (
              <>
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    isActive('/')
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Barang
                </Link>
                <Link
                  to="/my-rentals"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    isActive('/my-rentals')
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Sewa Saya
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    isActive('/admin/dashboard')
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/items"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    isActive('/admin/items')
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Barang
                </Link>
                <Link
                  to="/admin/payments"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    isActive('/admin/payments')
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Pembayaran
                </Link>
                <Link
                  to="/admin/rentals"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    isActive('/admin/rentals')
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Rental
                </Link>
              </>
            )}
          </div>

          {/* Kanan */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Avatar + nama */}
                <div className="flex items-center gap-2.5 bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5">
                  <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center text-xs text-orange-400 font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-300 text-sm font-medium">
                    {user.name}
                  </span>
                  {user.role === 'admin' && (
                    <span className="text-xs bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-md font-medium">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-400 px-3 py-2 rounded-xl hover:bg-red-500/10 transition"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition font-medium"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition"
          >
            {menuOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-800 py-3 space-y-1">
            {user?.role === 'user' && (
              <>
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  Barang
                </Link>
                <Link
                  to="/my-rentals"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/my-rentals') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  Sewa Saya
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/admin/dashboard') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/items"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/admin/items') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  Barang
                </Link>
                <Link
                  to="/admin/payments"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/admin/payments') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  Pembayaran
                </Link>
                <Link
                  to="/admin/rentals"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/admin/rentals') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  Rental
                </Link>
              </>
            )}

            {/* Mobile user info & logout */}
            {user ? (
              <div className="pt-2 mt-2 border-t border-gray-800">
                <div className="flex items-center gap-2.5 px-4 py-2 mb-1">
                  <div className="w-7 h-7 bg-orange-500/20 rounded-lg flex items-center justify-center text-sm text-orange-400 font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {user.name}
                    </p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="pt-2 mt-2 border-t border-gray-800 space-y-1">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm bg-orange-500 text-white hover:bg-orange-600 transition text-center font-medium"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
