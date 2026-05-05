import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
    <div
      className={`text-2xl w-12 h-12 flex items-center justify-center rounded-xl ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-50 text-yellow-600' },
  active: { label: 'Aktif', color: 'bg-green-50 text-green-600' },
  completed: { label: 'Selesai', color: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-50 text-red-400' },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || 'Gagal memuat dashboard')
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-400">
          Memuat dashboard...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-red-400">{error}</div>
      </div>
    );

  const { ringkasan, rental_stats, pendapatan_bulanan, top_items } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard Admin
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Ringkasan performa Smart-Rent
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/payments')}
              className="relative text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Verifikasi Pembayaran
              {ringkasan.pending_payments > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {ringkasan.pending_payments}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/admin/items')}
              className="text-sm border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Kelola Barang
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Pendapatan"
            value={`Rp ${Number(ringkasan.total_pendapatan).toLocaleString('id-ID')}`}
            icon="💰"
            color="bg-blue-50"
          />
          <StatCard
            label="Total User"
            value={ringkasan.total_users}
            icon="👤"
            color="bg-purple-50"
          />
          <StatCard
            label="Total Barang"
            value={ringkasan.total_items}
            icon="📦"
            color="bg-green-50"
          />
          <StatCard
            label="Pembayaran Pending"
            value={ringkasan.pending_payments}
            icon="⏳"
            color="bg-yellow-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pendapatan Bulanan */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">
              Pendapatan Bulanan
            </h2>
            {pendapatan_bulanan.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Belum ada data pendapatan
              </p>
            ) : (
              <div className="space-y-3">
                {/* Cari nilai max untuk proporsi bar */}
                {(() => {
                  const max = Math.max(
                    ...pendapatan_bulanan.map((d) => d.total)
                  );
                  return pendapatan_bulanan.map((item) => (
                    <div key={item.bulan}>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{item.bulan}</span>
                        <span className="font-medium">
                          Rp {Number(item.total).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(item.total / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* Kolom kanan */}
          <div className="space-y-6">
            {/* Status Rental */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">
                Status Rental
              </h2>
              {rental_stats.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Belum ada data
                </p>
              ) : (
                <div className="space-y-2">
                  {rental_stats.map((stat) => {
                    const config =
                      statusConfig[stat.status] || statusConfig.pending;
                    return (
                      <div
                        key={stat.status}
                        className="flex items-center justify-between"
                      >
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}
                        >
                          {config.label}
                        </span>
                        <span className="font-bold text-gray-700">
                          {stat.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Barang */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">
                Barang Terpopuler
              </h2>
              {top_items.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Belum ada data
                </p>
              ) : (
                <div className="space-y-3">
                  {top_items.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-5">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 font-medium line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.total_sewa}x disewa
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
