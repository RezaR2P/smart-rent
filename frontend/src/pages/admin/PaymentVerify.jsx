import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';

const statusConfig = {
  pending: { label: 'Menunggu', color: 'bg-yellow-50 text-yellow-600' },
  verified: { label: 'Terverifikasi', color: 'bg-green-50 text-green-600' },
  rejected: { label: 'Ditolak', color: 'bg-red-50 text-red-400' },
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-400">Memuat...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Verifikasi Pembayaran
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {payments.filter((p) => p.status === 'pending').length} pembayaran
            menunggu verifikasi
          </p>
        </div>

        {/* Filter Tab */}
        <div className="flex gap-2 mb-5">
          {['pending', 'verified', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-500 border hover:bg-gray-50'
              }`}
            >
              {statusConfig[s].label}
              <span className="ml-1.5 text-xs opacity-70">
                ({payments.filter((p) => p.status === s).length})
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            Tidak ada pembayaran dengan status ini
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((payment) => {
              const status = statusConfig[payment.status];
              return (
                <div
                  key={payment.id}
                  className="bg-white rounded-xl shadow-sm p-5"
                >
                  <div className="flex items-start gap-4">
                    {/* Bukti bayar thumbnail */}
                    <img
                      src={`http://localhost:5000/uploads/${payment.proof_image}`}
                      alt="Bukti bayar"
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100 flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                      onClick={() => {
                        setPreview(payment);
                        setMsg('');
                      }}
                      onError={(e) => {
                        e.target.src =
                          'https://placehold.co/80x80?text=No+Image';
                      }}
                    />

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {payment.user_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {payment.email}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-gray-600 space-y-0.5">
                        <p>📦 {payment.item_name}</p>
                        <p>
                          📅 {payment.start_date?.split('T')[0]} →{' '}
                          {payment.end_date?.split('T')[0]}
                        </p>
                        <p>
                          💰{' '}
                          <span className="font-semibold text-gray-800">
                            Rp {Number(payment.amount).toLocaleString('id-ID')}
                          </span>
                        </p>
                      </div>

                      {/* Aksi — hanya kalau pending */}
                      {payment.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              setPreview(payment);
                              setMsg('');
                            }}
                            className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
                          >
                            Lihat Bukti
                          </button>
                          <button
                            onClick={() => handleVerify(payment.id, 'verified')}
                            disabled={processing}
                            className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition disabled:opacity-40"
                          >
                            ✓ Verifikasi
                          </button>
                          <button
                            onClick={() => handleVerify(payment.id, 'rejected')}
                            disabled={processing}
                            className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100 transition disabled:opacity-40"
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

      {/* Modal Preview Bukti */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Bukti Pembayaran
              </h2>
              <button
                onClick={() => {
                  setPreview(null);
                  setMsg('');
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Info singkat */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mb-4 space-y-1">
              <p>
                <span className="font-medium">User:</span> {preview.user_name}
              </p>
              <p>
                <span className="font-medium">Barang:</span> {preview.item_name}
              </p>
              <p>
                <span className="font-medium">Total:</span> Rp{' '}
                {Number(preview.amount).toLocaleString('id-ID')}
              </p>
            </div>

            {/* Gambar bukti */}
            <img
              src={`http://localhost:5000/uploads/${preview.proof_image}`}
              alt="Bukti bayar"
              className="w-full rounded-lg object-contain max-h-72 bg-gray-100 mb-4"
              onError={(e) => {
                e.target.src =
                  'https://placehold.co/400x300?text=Gambar+tidak+ditemukan';
              }}
            />

            {msg && (
              <p
                className={`text-sm mb-3 text-center ${msg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}
              >
                {msg}
              </p>
            )}

            {/* Tombol aksi — hanya kalau masih pending */}
            {preview.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleVerify(preview.id, 'rejected')}
                  disabled={processing}
                  className="flex-1 border border-red-200 text-red-500 rounded-lg py-2 text-sm hover:bg-red-50 transition disabled:opacity-40"
                >
                  ✕ Tolak
                </button>
                <button
                  onClick={() => handleVerify(preview.id, 'verified')}
                  disabled={processing}
                  className="flex-1 bg-green-500 text-white rounded-lg py-2 text-sm hover:bg-green-600 transition disabled:opacity-40"
                >
                  ✓ Verifikasi
                </button>
              </div>
            )}

            {preview.status !== 'pending' && (
              <p
                className={`text-center text-sm font-medium ${statusConfig[preview.status]?.color}`}
              >
                Pembayaran sudah {statusConfig[preview.status]?.label}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerify;
