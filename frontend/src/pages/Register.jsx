import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import bgRegis from '../../public/image/regis.avif';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Panel Kiri */}
      <div
        className="relative hidden lg:flex lg:w-1/2 flex-col justify-center p-12 bg-gray-900 border-r border-gray-800  bg-cover bg-center"
        style={{ backgroundImage: `url(${bgRegis})` }}
      >
        {/* Logo */}
        <div className="pointer-events-none absolute inset-0 bg-black/50"></div>
        {/* Tagline */}
        <div className="max-w-md space-y-5 relative z-10 p-6  bg-white/2 rounded-lg">
          <h1 className="text-white text-4xl font-bold leading-tight mb-3 ">
            Sewa Alat,
            <br />
            <span className="text-orange-500">Hobi Jadi Lebih Mudah.</span>
          </h1>
          <p className="text-white text-sm leading-relaxed">
            "Daftar gratis, sewa kapan saja."
          </p>
        </div>
      </div>

      {/* Panel Kanan — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              📦
            </div>
            <span className="text-white font-bold text-lg">Smart-Rent</span>
          </div>

          <h2 className="text-white text-2xl font-bold mb-1">Buat akun baru</h2>
          <p className="text-gray-500 text-sm mb-8">
            Gratis selamanya, daftar dalam 30 detik
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="nama@email.com"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Min. 6 karakter"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {loading ? 'Mendaftar...' : 'Buat Akun'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Sudah punya akun?{' '}
            <Link
              to="/login"
              className="text-orange-500 hover:text-orange-400 font-medium transition"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
