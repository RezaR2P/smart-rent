import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    dot: 'bg-yellow-400',
  },
  active: {
    label: 'Aktif',
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    dot: 'bg-green-400',
  },
  completed: {
    label: 'Selesai',
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    dot: 'bg-gray-400',
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    dot: 'bg-red-400',
  },
};

const RentalManage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [search, setSearch] = useState('');

  // Modal pengembalian
  const [simulation, setSimulation] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  const fetchRentals = async () => {
    try {
      const res = await api.get('/rentals');
      setRentals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      fetchRentals();
    })();
  }, []);

  const openSimulate = async (rental) => {
    setSimLoading(true);
    setResultMsg('');
    try {
      const res = await api.get(`/rentals/${rental.id}/simulate`);
      setSimulation(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!simulation) return;
    setProcessing(true);
    setResultMsg('');
    try {
      const res = await api.post(`/rentals/${simulation.rental_id}/return`);
      setResultMsg(
        res.data.late_days > 0
          ? `✅ Selesai! Terlambat ${res.data.late_days} hari. Denda: Rp ${Number(res.data.late_fee).toLocaleString('id-ID')}`
          : '✅ Pengembalian tepat waktu, tidak ada denda!'
      );
      fetchRentals();
      setTimeout(() => {
        setSimulation(null);
        setResultMsg('');
      }, 3000);
    } catch (err) {
      setResultMsg(err.response?.data?.message || 'Gagal memproses');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = rentals
    .filter((r) => r.status === filter)
    .filter(
      (r) =>
        search === '' ||
        r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.item_name?.toLowerCase().includes(search.toLowerCase())
    );

  const lateCount = rentals.filter(
    (r) => r.status === 'active' && new Date() > new Date(r.end_date)
  ).length;

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse"
            >
              <div className="flex justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-1/3" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                  <div className="h-3 bg-gray-800 rounded w-1/4" />
                </div>
                <div className="h-8 w-28 bg-gray-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold mb-1">
              Kelola Rental
            </h1>
            <p className="text-gray-500 text-sm">
              {lateCount > 0 ? (
                <span>
                  <span className="text-red-400 font-medium">
                    {lateCount} rental
                  </span>{' '}
                  melewati batas waktu
                </span>
              ) : (
                'Proses pengembalian & hitung denda'
              )}
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Cari user atau barang..."
              className="w-full sm:w-64 bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tab filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {Object.entries(statusConfig).map(([key, val]) => {
            const count = rentals.filter((r) => r.status === key).length;
            const hasLate = key === 'active' && lateCount > 0;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  filter === key
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                }`}
              >
                {val.label}
                <span className="ml-1.5 text-xs opacity-60">({count})</span>
                {hasLate && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-white font-medium mb-1">Tidak ada rental</p>
            <p className="text-gray-500 text-sm">
              {search
                ? 'Coba kata kunci lain'
                : 'Tidak ada rental dengan status ini'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((rental) => {
              const status = statusConfig[rental.status];
              const isLate =
                rental.status === 'active' &&
                new Date() > new Date(rental.end_date);
              const daysLate = isLate
                ? Math.ceil(
                    (new Date() - new Date(rental.end_date)) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0;

              return (
                <div
                  key={rental.id}
                  className={`bg-gray-900 border rounded-2xl p-5 transition ${
                    isLate
                      ? 'border-red-500/30 hover:border-red-500/50'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* User info */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div className="w-7 h-7 bg-orange-500/10 rounded-lg flex items-center justify-center text-xs text-orange-400 font-bold shrink-0">
                          {rental.user_name?.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-white font-semibold text-sm">
                          {rental.user_name}
                        </p>
                        <span className="text-gray-600 text-xs">
                          {rental.email}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${status.color}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                          />
                          {status.label}
                        </span>
                        {isLate && (
                          <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-medium">
                            ⚠️ Terlambat {daysLate} hari
                          </span>
                        )}
                      </div>

                      {/* Detail */}
                      <div className="text-xs text-gray-500 space-y-0.5 ml-9">
                        <p>
                          📦{' '}
                          <span className="text-gray-300">
                            {rental.item_name}
                          </span>
                        </p>
                        <p>
                          📅 {rental.start_date?.split('T')[0]} →{' '}
                          {rental.end_date?.split('T')[0]}
                        </p>
                        <p>
                          💰 Sewa:{' '}
                          <span className="text-white font-medium">
                            Rp{' '}
                            {Number(rental.total_price).toLocaleString('id-ID')}
                          </span>
                          {rental.late_fee > 0 && (
                            <span className="text-red-400 ml-1.5">
                              + denda Rp{' '}
                              {Number(rental.late_fee).toLocaleString('id-ID')}
                            </span>
                          )}
                        </p>
                        {rental.returned_at && (
                          <p>
                            🔄 Dikembalikan:{' '}
                            {new Date(rental.returned_at).toLocaleDateString(
                              'id-ID'
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tombol */}
                    {rental.status === 'active' && (
                      <button
                        onClick={() => openSimulate(rental)}
                        disabled={simLoading}
                        className={`shrink-0 text-xs font-medium px-4 py-2 rounded-xl transition disabled:opacity-40 ${
                          isLate
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                      >
                        {simLoading ? '...' : 'Proses Kembali'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Simulasi */}
      {simulation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">
                Proses Pengembalian
              </h2>
              {!simulation.done && (
                <button
                  onClick={() => {
                    setSimulation(null);
                    setResultMsg('');
                  }}
                  className="text-gray-600 hover:text-white transition text-xl leading-none"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Info rental */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">User</span>
                <span className="text-white font-medium">
                  {simulation.user_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Barang</span>
                <span className="text-white font-medium">
                  {simulation.item_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Batas kembali</span>
                <span className="text-white font-medium">
                  {simulation.end_date?.split('T')[0]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dikembalikan</span>
                <span className="text-white font-medium">
                  {new Date(simulation.checked_at).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>

            {/* Kalkulasi denda */}
            <div
              className={`rounded-xl p-4 text-sm space-y-2 mb-4 border ${
                simulation.late_days > 0
                  ? 'bg-red-500/5 border-red-500/20'
                  : 'bg-green-500/5 border-green-500/20'
              }`}
            >
              {simulation.late_days > 0 ? (
                <>
                  <p className="text-red-400 font-semibold">
                    ⚠️ Terlambat {simulation.late_days} hari
                  </p>
                  <div className="flex justify-between text-gray-400">
                    <span>Denda per hari</span>
                    <span>
                      Rp{' '}
                      {Number(simulation.fee_per_day).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-400 font-medium">
                    <span>Total denda</span>
                    <span>
                      Rp {Number(simulation.late_fee).toLocaleString('id-ID')}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-green-400 font-semibold">
                  ✅ Tepat waktu, tidak ada denda
                </p>
              )}
              <div className="flex justify-between text-white font-bold pt-2 border-t border-gray-700">
                <span>Total tagihan</span>
                <span className="text-orange-500">
                  Rp {Number(simulation.total_tagihan).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Hasil */}
            {resultMsg === 'ontime' && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-4 text-green-400 text-sm text-center">
                ✅ Pengembalian tepat waktu berhasil diproses!
              </div>
            )}
            {resultMsg === 'late' && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 mb-4 text-orange-400 text-sm text-center">
                ✅ Pengembalian diproses. Denda: Rp{' '}
                {Number(simulation.late_fee).toLocaleString('id-ID')}
              </div>
            )}
            {resultMsg === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-red-400 text-sm text-center">
                Gagal memproses pengembalian
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSimulation(null);
                  setResultMsg('');
                }}
                className="flex-1 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 py-2.5 rounded-xl text-sm transition"
              >
                {simulation.done ? 'Tutup' : 'Batal'}
              </button>
              {!simulation.done && (
                <button
                  onClick={handleReturn}
                  disabled={processing}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-40"
                >
                  {processing ? 'Memproses...' : 'Konfirmasi'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalManage;
