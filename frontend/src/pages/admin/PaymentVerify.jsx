import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';

const statusConfig = {
  pending: {
    label: 'Menunggu',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  verified: {
    label: 'Terverifikasi',
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  rejected: {
    label: 'Ditolak',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

const PaymentVerify = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  // Modal preview
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchPayments();
    })();
  }, []);

  const handleVerify = async (id, status) => {
    setProcessing(true);
    setMsg('');
    try {
      await api.patch(`/payments/${id}/verify`, { status });
      setMsg(
        status === 'verified'
          ? '✅ Pembayaran diverifikasi!'
          : '❌ Pembayaran ditolak'
      );
      fetchPayments();
      // Update preview juga
      setPreview((prev) => (prev ? { ...prev, status } : null));
    } catch (err) {
      setMsg(err.response?.data?.message || 'Gagal memproses');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = payments.filter((p) => p.status === filter);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse flex gap-4"
            >
              <div className="w-20 h-20 bg-gray-800 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-800 rounded w-1/3" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
                <div className="h-3 bg-gray-800 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white text-2xl font-bold mb-1">
            Verifikasi Pembayaran
          </h1>
          <p className="text-gray-500 text-sm">
            {payments.filter((p) => p.status === 'pending').length > 0 ? (
              <span>
                <span className="text-orange-500 font-medium">
                  {payments.filter((p) => p.status === 'pending').length}{' '}
                  pembayaran
                </span>{' '}
                menunggu verifikasi
              </span>
            ) : (
              'Semua pembayaran sudah diproses'
            )}
          </p>
        </div>

        {/* Tab filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {Object.entries(statusConfig).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
              }`}
            >
              {val.label}
              <span className="ml-1.5 text-xs opacity-60">
                ({payments.filter((p) => p.status === key).length})
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
            <p className="text-3xl mb-3">✅</p>
            <p className="text-white font-medium mb-1">Tidak ada pembayaran</p>
            <p className="text-gray-500 text-sm">
              Tidak ada pembayaran dengan status ini
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((payment) => {
              const status = statusConfig[payment.status];
              return (
                <div
                  key={payment.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition"
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail bukti */}
                    <div
                      className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 shrink-0 cursor-pointer hover:opacity-80 transition relative group"
                      onClick={() => {
                        setPreview(payment);
                        setMsg('');
                      }}
                    >
                      <img
                        src={`http://localhost:5000/uploads/${payment.proof_image}`}
                        alt="Bukti"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            'https://placehold.co/80x80/1f2937/4b5563?text=?';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          Lihat
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {payment.user_name}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {payment.email}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5 mb-3">
                        <p>📦 {payment.item_name}</p>
                        <p>
                          📅 {payment.start_date?.split('T')[0]} →{' '}
                          {payment.end_date?.split('T')[0]}
                        </p>
                        <p>
                          💰{' '}
                          <span className="text-white font-semibold">
                            Rp {Number(payment.amount).toLocaleString('id-ID')}
                          </span>
                        </p>
                      </div>

                      {/* Aksi inline */}
                      {payment.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setPreview(payment);
                              setMsg('');
                            }}
                            className="text-xs bg-gray-800 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition border border-gray-700"
                          >
                            Lihat Bukti
                          </button>
                          <button
                            onClick={() => handleVerify(payment.id, 'verified')}
                            disabled={processing}
                            className="text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition border border-green-500/20 disabled:opacity-40"
                          >
                            ✓ Verifikasi
                          </button>
                          <button
                            onClick={() => handleVerify(payment.id, 'rejected')}
                            disabled={processing}
                            className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition border border-red-500/20 disabled:opacity-40"
                          >
                            ✕ Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Preview */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
            {/* Header modal */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Bukti Pembayaran</h2>
              <button
                onClick={() => {
                  setPreview(null);
                  setMsg('');
                }}
                className="text-gray-600 hover:text-white transition text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Info ringkas */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm mb-4 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">User</span>
                <span className="text-white font-medium">
                  {preview.user_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Barang</span>
                <span className="text-white font-medium">
                  {preview.item_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="text-orange-500 font-bold">
                  Rp {Number(preview.amount).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Gambar bukti */}
            <div className="rounded-xl overflow-hidden bg-gray-800 mb-4">
              <img
                src={`http://localhost:5000/uploads/${preview.proof_image}`}
                alt="Bukti bayar"
                className="w-full max-h-72 object-contain"
                onError={(e) => {
                  e.target.src =
                    'https://placehold.co/400x300/1f2937/4b5563?text=Gambar+tidak+ditemukan';
                }}
              />
            </div>

            {/* Feedback */}
            {msg === 'verified' && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-4 text-green-400 text-sm text-center">
                ✓ Pembayaran berhasil diverifikasi!
              </div>
            )}
            {msg === 'rejected' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-red-400 text-sm text-center">
                ✕ Pembayaran ditolak
              </div>
            )}

            {/* Tombol aksi */}
            {preview.status === 'pending' && !msg && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleVerify(preview.id, 'rejected')}
                  disabled={processing}
                  className="flex-1 border border-red-500/20 text-red-400 hover:bg-red-500/10 py-2.5 rounded-xl text-sm transition disabled:opacity-40"
                >
                  ✕ Tolak
                </button>
                <button
                  onClick={() => handleVerify(preview.id, 'verified')}
                  disabled={processing}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-40"
                >
                  ✓ Verifikasi
                </button>
              </div>
            )}

            {preview.status !== 'pending' && !msg && (
              <div
                className={`text-center text-sm font-medium px-4 py-2.5 rounded-xl border ${statusConfig[preview.status]?.color}`}
              >
                Pembayaran sudah {statusConfig[preview.status]?.label}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerify;
