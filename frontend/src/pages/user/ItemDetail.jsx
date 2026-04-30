import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ start_date: '', end_date: '' });
  const [simulation, setSimulation] = useState(null);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api
      .get(`/items/${id}`)
      .then((res) => setItem(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  // Simulasi harga otomatis saat tanggal berubah
  useEffect(() => {
    if (form.start_date && form.end_date && item) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        setSimulation({
          days,
          total: days * item.price_per_day,
        });
        setError('');
      } else {
        setSimulation(null);
        setError('Tanggal akhir harus setelah tanggal mulai');
      }
    } else {
      setSimulation(null);
    }
  }, [form.start_date, form.end_date, item]);

  const handleBooking = async () => {
    if (!user) return navigate('/login');
    if (!simulation) return;

    setBookingLoading(true);
    setError('');
    try {
      const res = await api.post('/rentals', {
        item_id: id,
        start_date: form.start_date,
        end_date: form.end_date,
      });
      setSuccess(
        `Booking berhasil! Total: Rp ${Number(res.data.total_price).toLocaleString('id-ID')}`
      );
      setTimeout(() => navigate('/my-rentals'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking gagal');
    } finally {
      setBookingLoading(false);
    }
  };

  // Tanggal minimum = hari ini
  const today = new Date().toISOString().split('T')[0];

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-400">Memuat...</div>
      </div>
    );

  if (!item) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tombol kembali */}
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-500 hover:text-blue-500 mb-6 flex items-center gap-1"
        >
          ← Kembali
        </button>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden md:flex">
          {/* Gambar */}
          <div className="md:w-1/2">
            <img
              src={
                item.image_url?.startsWith('http')
                  ? item.image_url
                  : `http://localhost:5000/uploads/${item.image_url}`
              }
              alt={item.name}
              className="w-full h-64 md:h-full object-cover bg-gray-100"
              onError={(e) => {
                e.target.src = 'https://placehold.co/600x400?text=No+Image';
              }}
            />
          </div>

          {/* Info + Form */}
          <div className="md:w-1/2 p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                {item.category_name || 'Umum'}
              </span>
              <h1 className="text-xl font-bold text-gray-800 mt-2">
                {item.name}
              </h1>
              <p className="text-gray-500 text-sm mt-2 mb-4">
                {item.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-blue-600">
                    Rp {Number(item.price_per_day).toLocaleString('id-ID')}
                  </span>
                  <span className="text-gray-400 text-sm"> / hari</span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${item.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}
                >
                  {item.stock > 0
                    ? `Stok tersedia: ${item.stock}`
                    : 'Stok habis'}
                </span>
              </div>

              {/* Form tanggal */}
              {item.stock > 0 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      min={today}
                      className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.start_date}
                      onChange={(e) =>
                        setForm({ ...form, start_date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      min={form.start_date || today}
                      className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.end_date}
                      onChange={(e) =>
                        setForm({ ...form, end_date: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Simulasi harga */}
            {simulation && (
              <div className="mt-4 bg-blue-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Durasi</span>
                  <span>{simulation.days} hari</span>
                </div>
                <div className="flex justify-between text-gray-600 mt-1">
                  <span>Harga/hari</span>
                  <span>
                    Rp {Number(item.price_per_day).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-blue-700 mt-2 pt-2 border-t border-blue-200">
                  <span>Total</span>
                  <span>
                    Rp {Number(simulation.total).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {/* Pesan error / sukses */}
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            {success && (
              <p className="text-green-600 text-sm mt-3">{success}</p>
            )}

            {/* Tombol booking */}
            {item.stock > 0 && (
              <button
                onClick={handleBooking}
                disabled={!simulation || bookingLoading}
                className="mt-4 w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                {bookingLoading ? 'Memproses...' : 'Booking Sekarang'}
              </button>
            )}

            {!user && item.stock > 0 && (
              <p className="text-center text-xs text-gray-400 mt-2">
                Kamu perlu{' '}
                <a href="/login" className="text-blue-500">
                  login
                </a>{' '}
                untuk booking
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
