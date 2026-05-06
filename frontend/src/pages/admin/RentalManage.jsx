import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-50 text-yellow-600' },
  active: { label: 'Aktif', color: 'bg-green-50 text-green-600' },
  completed: { label: 'Selesai', color: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-50 text-red-400' },
};

export default function RentalManage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  // Modal pengembalian
  const [simulation, setSimulation] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  useEffect(() => {
    fetchRentals();
  }, []);

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

  const filtered = rentals.filter((r) => r.status === filter);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-400">Memuat...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Kelola Rental</h1>
          <p className="text-gray-500 text-sm mt-1">
            Proses pengembalian & hitung denda keterlambatan
          </p>
        </div>

        {/* Filter Tab */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {Object.entries(statusConfig).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-500 border hover:bg-gray-50'
              }`}
            >
              {val.label}
              <span className="ml-1.5 text-xs opacity-70">
                ({rentals.filter((r) => r.status === key).length})
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            Tidak ada rental dengan status ini
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((rental) => {
              const status = statusConfig[rental.status];
              const isLate =
                rental.status === 'active' &&
                new Date() > new Date(rental.end_date);

              return (
                <div
                  key={rental.id}
                  className={`bg-white rounded-xl shadow-sm p-5 ${isLate ? 'border-l-4 border-red-400' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800">
                          {rental.user_name}
                        </p>
                        <span className="text-gray-300">·</span>
                        <p className="text-sm text-gray-500">{rental.email}</p>
                        {isLate && (
                          <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">
                            ⚠️ Terlambat
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium text-gray-700 mb-2">
                        📦 {rental.item_name}
                      </p>

                      <div className="text-sm text-gray-500 space-y-0.5">
                        <p>
                          📅 {rental.start_date?.split('T')[0]} →{' '}
                          {rental.end_date?.split('T')[0]}
                        </p>
                        <p>
                          💰 Sewa:{' '}
                          <span className="font-medium text-gray-700">
                            Rp{' '}
                            {Number(rental.total_price).toLocaleString('id-ID')}
                          </span>
                        </p>
                        {rental.late_fee > 0 && (
                          <p>
                            🔴 Denda:{' '}
                            <span className="font-medium text-red-600">
                              Rp{' '}
                              {Number(rental.late_fee).toLocaleString('id-ID')}
                            </span>
                          </p>
                        )}
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

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                      {rental.status === 'active' && (
                        <button
                          onClick={() => openSimulate(rental)}
                          disabled={simLoading}
                          className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition disabled:opacity-40"
                        >
                          Proses Pengembalian
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Simulasi Denda */}
      {simulation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Proses Pengembalian
              </h2>
              <button
                onClick={() => setSimulation(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Info rental */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">User</span>
                <span className="font-medium">{simulation.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Barang</span>
                <span className="font-medium">{simulation.item_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Batas Kembali</span>
                <span className="font-medium">
                  {simulation.end_date?.split('T')[0]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dikembalikan</span>
                <span className="font-medium">
                  {new Date(simulation.checked_at).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>

            {/* Kalkulasi denda */}
            <div
              className={`rounded-lg p-4 text-sm space-y-2 mb-4 ${simulation.late_days > 0 ? 'bg-red-50' : 'bg-green-50'}`}
            >
              {simulation.late_days > 0 ? (
                <>
                  <p className="font-semibold text-red-600">
                    ⚠️ Terlambat {simulation.late_days} hari
                  </p>
                  <div className="flex justify-between text-gray-600">
                    <span>Denda/hari</span>
                    <span>
                      Rp{' '}
                      {Number(simulation.fee_per_day).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Total Denda</span>
                    <span>
                      Rp {Number(simulation.late_fee).toLocaleString('id-ID')}
                    </span>
                  </div>
                </>
              ) : (
                <p className="font-semibold text-green-600">
                  ✅ Pengembalian tepat waktu, tidak ada denda
                </p>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-gray-800">
                <span>Total Tagihan</span>
                <span>
                  Rp {Number(simulation.total_tagihan).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {resultMsg && (
              <p
                className={`text-sm mb-3 text-center ${resultMsg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}
              >
                {resultMsg}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSimulation(null)}
                className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleReturn}
                disabled={processing || !!resultMsg}
                className="flex-1 bg-blue-500 text-white rounded-lg py-2 text-sm hover:bg-blue-600 transition disabled:opacity-40"
              >
                {processing ? 'Memproses...' : 'Konfirmasi Pengembalian'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
