import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';

const StatCard = ({ label, value, icon, sub, accent }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition">
    <div className="flex items-start justify-between mb-4">
      <span className="text-2xl">{icon}</span>
      {sub && (
        <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
          {sub}
        </span>
      )}
    </div>
    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
      {label}
    </p>
    <p
      className={`text-2xl font-bold ${accent ? 'text-orange-500' : 'text-white'}`}
    >
      {value}
    </p>
  </div>
);

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  active: {
    label: 'Aktif',
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  completed: {
    label: 'Selesai',
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

export default function AdminDashboard() {
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
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse"
              >
                <div className="h-8 w-8 bg-gray-800 rounded-xl mb-4" />
                <div className="h-3 bg-gray-800 rounded w-1/2 mb-2" />
                <div className="h-7 bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="text-center py-20 text-red-400">{error}</div>
      </div>
    );

  const { ringkasan, rental_stats, pendapatan_bulanan, top_items } = data;
  const maxPendapatan = Math.max(...pendapatan_bulanan.map((d) => d.total), 1);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold mb-1">Dashboard</h1>
            <p className="text-gray-500 text-sm">
              Ringkasan performa Smart-Rent
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/payments')}
              className="relative text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition font-medium"
            >
              Pembayaran
              {ringkasan.pending_payments > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {ringkasan.pending_payments}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/admin/items')}
              className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition border border-gray-700"
            >
              Kelola Barang
            </button>
            <button
              onClick={() => navigate('/admin/rentals')}
              className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition border border-gray-700"
            >
              Rental
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Pendapatan"
            value={`Rp ${Number(ringkasan.total_pendapatan).toLocaleString('id-ID')}`}
            icon="💰"
            accent
          />
          <StatCard
            label="Total User"
            value={ringkasan.total_users}
            icon="👤"
          />
          <StatCard
            label="Total Barang"
            value={ringkasan.total_items}
            icon="📦"
          />
          <StatCard
            label="Menunggu Verifikasi"
            value={ringkasan.pending_payments}
            icon="⏳"
            sub={ringkasan.pending_payments > 0 ? 'Perlu aksi' : null}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pendapatan Bulanan */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-semibold">Pendapatan Bulanan</h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  12 bulan terakhir
                </p>
              </div>
            </div>

            {pendapatan_bulanan.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-3xl mb-3">📊</p>
                <p className="text-gray-500 text-sm">
                  Belum ada data pendapatan
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendapatan_bulanan.map((item) => (
                  <div key={item.bulan}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-gray-400 text-xs">
                        {item.bulan}
                      </span>
                      <span className="text-white text-xs font-medium">
                        Rp {Number(item.total).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${(item.total / maxPendapatan) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kolom kanan */}
          <div className="space-y-5">
            {/* Status Rental */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">Status Rental</h2>
              {rental_stats.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Belum ada data
                </p>
              ) : (
                <div className="space-y-2.5">
                  {rental_stats.map((stat) => {
                    const config =
                      statusConfig[stat.status] || statusConfig.pending;
                    return (
                      <div
                        key={stat.status}
                        className="flex items-center justify-between"
                      >
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium border ${config.color}`}
                        >
                          {config.label}
                        </span>
                        <span className="text-white font-bold text-sm">
                          {stat.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Barang */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">
                Barang Terpopuler
              </h2>
              {top_items.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Belum ada data
                </p>
              ) : (
                <div className="space-y-3">
                  {top_items.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold w-5 text-center ${
                          index === 0
                            ? 'text-orange-500'
                            : index === 1
                              ? 'text-gray-300'
                              : index === 2
                                ? 'text-orange-700'
                                : 'text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-800 rounded-full h-1">
                            <div
                              className="bg-orange-500/50 h-1 rounded-full"
                              style={{
                                width: `${(item.total_sewa / top_items[0].total_sewa) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-gray-500 text-xs shrink-0">
                            {item.total_sewa}x
                          </span>
                        </div>
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
}
