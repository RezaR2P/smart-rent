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

  useEffect(() => {
    if (form.start_date && form.end_date && item) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        setSimulation({ days, total: days * item.price_per_day });
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

  const today = new Date().toISOString().split('T')[0];

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden md:flex animate-pulse">
            <div className="md:w-1/2 h-72 bg-gray-800" />
            <div className="md:w-1/2 p-8 space-y-4">
              <div className="h-4 bg-gray-800 rounded-lg w-1/4" />
              <div className="h-6 bg-gray-800 rounded-lg w-3/4" />
              <div className="h-4 bg-gray-800 rounded-lg w-full" />
              <div className="h-4 bg-gray-800 rounded-lg w-2/3" />
              <div className="h-10 bg-gray-800 rounded-xl mt-8" />
              <div className="h-10 bg-gray-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );

  if (!item) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tombol kembali */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition"
        >
          ← Kembali ke daftar barang
        </button>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden md:flex">
          {/* Gambar */}
          <div className="md:w-1/2 relative bg-gray-800">
            <img
              src={
                item.image_url?.startsWith('http')
                  ? item.image_url
                  : `http://localhost:5000/uploads/${item.image_url}`
              }
              alt={item.name}
              className="w-full h-72 md:h-full object-cover"
              onError={(e) => {
                e.target.src =
                  'https://placehold.co/600x400/1f2937/4b5563?text=No+Image';
              }}
            />
            {/* Badge stok */}
            <div className="absolute top-4 left-4">
              {item.stock > 0 ? (
                <span className="bg-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm border border-green-500/20">
                  ✓ Tersedia · Stok {item.stock}
                </span>
              ) : (
                <span className="bg-red-500/20 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm border border-red-500/20">
                  Stok Habis
                </span>
              )}
            </div>
          </div>

          {/* Info + Form */}
          <div className="md:w-1/2 p-8 flex flex-col">
            {/* Header */}
            <div className="mb-6">
              {item.category_name && (
                <span className="text-orange-500 text-xs font-semibold uppercase tracking-widest">
                  {item.category_name}
                </span>
              )}
              <h1 className="text-white text-2xl font-bold mt-1 mb-3">
                {item.name}
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Harga */}
            <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-gray-800">
              <span className="text-orange-500 text-3xl font-bold">
                Rp {Number(item.price_per_day).toLocaleString('id-ID')}
              </span>
              <span className="text-gray-600 text-sm">/ hari</span>
            </div>

            {item.stock > 0 ? (
              <>
                {/* Form tanggal */}
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 text-xs font-medium mb-2">
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        min={today}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                        value={form.start_date}
                        onChange={(e) =>
                          setForm({ ...form, start_date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs font-medium mb-2">
                        Tanggal Selesai
                      </label>
                      <input
                        type="date"
                        min={form.start_date || today}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                        value={form.end_date}
                        onChange={(e) =>
                          setForm({ ...form, end_date: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Simulasi harga */}
                {simulation && (
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-4">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
                      Ringkasan Biaya
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-400">
                        <span>Durasi sewa</span>
                        <span>{simulation.days} hari</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Harga per hari</span>
                        <span>
                          Rp{' '}
                          {Number(item.price_per_day).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between text-white font-semibold pt-2 border-t border-gray-700">
                        <span>Total</span>
                        <span className="text-orange-500">
                          Rp {Number(simulation.total).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error / Success */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-4 text-green-400 text-sm">
                    {success}
                  </div>
                )}

                {/* Tombol booking */}
                <button
                  onClick={handleBooking}
                  disabled={!simulation || bookingLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition hover:shadow-lg hover:shadow-orange-500/20 disabled:opacity-30 disabled:cursor-not-allowed mt-auto"
                >
                  {bookingLoading
                    ? 'Memproses...'
                    : !simulation
                      ? 'Pilih tanggal sewa'
                      : `Booking Sekarang · Rp ${Number(simulation.total).toLocaleString('id-ID')}`}
                </button>

                {!user && (
                  <p className="text-center text-gray-600 text-xs mt-3">
                    Perlu{' '}
                    <button
                      onClick={() => navigate('/login')}
                      className="text-orange-500 hover:underline"
                    >
                      login
                    </button>{' '}
                    untuk booking
                  </p>
                )}
              </>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-center mt-auto">
                <p className="text-gray-400 text-sm mb-3">
                  Barang ini sedang tidak tersedia
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="text-sm bg-gray-700 text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-600 transition"
                >
                  Lihat barang lain
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
