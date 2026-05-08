import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';

const statusConfig = {
  pending: {
    label: 'Menunggu Pembayaran',
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

const paymentStatusInfo = {
  pending: {
    label: '⏳ Bukti bayar sedang diverifikasi admin',
    color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  },
  verified: {
    label: '✓ Pembayaran terverifikasi',
    color: 'bg-green-500/10 border-green-500/20 text-green-400',
  },
  rejected: {
    label: '✕ Bukti bayar ditolak, silakan upload ulang',
    color: 'bg-red-500/10 border-red-500/20 text-red-400',
  },
};

export default function MyRentals() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Modal upload
  const [selectedRental, setSelectedRental] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  const fetchRentals = () => {
    api
      .get('/rentals/my')
      .then((res) => setRentals(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    const formData = new FormData();
    formData.append('rental_id', selectedRental.id);
    formData.append('proof_image', file);
    try {
      await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMsg('success');
      setFile(null);
      fetchRentals();
      setTimeout(() => {
        setSelectedRental(null);
        setUploadMsg('');
      }, 2000);
    } catch (err) {
      setUploadMsg(err.response?.data?.message || 'Upload gagal');
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Aktif' },
    { key: 'completed', label: 'Selesai' },
  ];

  const filtered =
    activeTab === 'all'
      ? rentals
      : rentals.filter((r) => r.status === activeTab);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-800 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-800 rounded-lg w-1/2" />
                  <div className="h-3 bg-gray-800 rounded-lg w-1/3" />
                  <div className="h-3 bg-gray-800 rounded-lg w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white text-2xl font-bold mb-1">Sewa Saya</h1>
          <p className="text-gray-500 text-sm">
            {rentals.length > 0
              ? `${rentals.length} total transaksi sewa`
              : 'Belum ada riwayat sewa'}
          </p>
        </div>

        {rentals.length === 0 ? (
          /* Empty state */
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-white font-semibold mb-2">
              Belum ada riwayat sewa
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Mulai sewa peralatan favoritmu sekarang
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
            >
              Lihat Barang
            </button>
          </div>
        ) : (
          <>
            {/* Tab filter */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    activeTab === tab.key
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 text-xs opacity-60">
                    (
                    {tab.key === 'all'
                      ? rentals.length
                      : rentals.filter((r) => r.status === tab.key).length}
                    )
                  </span>
                </button>
              ))}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-sm">
                Tidak ada rental dengan status ini
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((rental) => {
                  const status =
                    statusConfig[rental.status] || statusConfig.pending;
                  const payInfo = rental.payment_status
                    ? paymentStatusInfo[rental.payment_status]
                    : null;

                  return (
                    <div
                      key={rental.id}
                      className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition"
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Gambar */}
                          <img
                            src={
                              rental.image_url?.startsWith('http')
                                ? rental.image_url
                                : `/uploads/${rental.image_url}`
                            }
                            alt={rental.item_name}
                            className="w-20 h-20 object-cover rounded-xl bg-gray-800 shrink-0"
                            onError={(e) => {
                              e.target.src =
                                'https://placehold.co/80x80/1f2937/4b5563?text=?';
                            }}
                          />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="text-white font-semibold text-sm truncate">
                                {rental.item_name}
                              </h3>
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 flex items-center gap-1.5 ${status.color}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                                />
                                {status.label}
                              </span>
                            </div>

                            <div className="space-y-1 text-xs text-gray-500">
                              <p>
                                📅 {rental.start_date?.split('T')[0]} →{' '}
                                {rental.end_date?.split('T')[0]}
                              </p>
                              <p>
                                💰 Total sewa:{' '}
                                <span className="text-white font-semibold">
                                  Rp{' '}
                                  {Number(rental.total_price).toLocaleString(
                                    'id-ID'
                                  )}
                                </span>
                                {rental.late_fee > 0 && (
                                  <span className="text-red-400 ml-1">
                                    + denda Rp{' '}
                                    {Number(rental.late_fee).toLocaleString(
                                      'id-ID'
                                    )}
                                  </span>
                                )}
                              </p>
                              {rental.returned_at && (
                                <p>
                                  🔄 Dikembalikan:{' '}
                                  {new Date(
                                    rental.returned_at
                                  ).toLocaleDateString('id-ID')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Info status pembayaran */}
                        {rental.status === 'pending' && payInfo && (
                          <div
                            className={`mt-3 text-xs px-3 py-2 rounded-xl border ${payInfo.color}`}
                          >
                            {payInfo.label}
                          </div>
                        )}

                        {/* Tombol upload */}
                        {rental.status === 'pending' &&
                          !rental.payment_status && (
                            <button
                              onClick={() => {
                                setSelectedRental(rental);
                                setFile(null);
                                setUploadMsg('');
                              }}
                              className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2.5 rounded-xl transition"
                            >
                              Upload Bukti Bayar
                            </button>
                          )}

                        {rental.status === 'pending' &&
                          rental.payment_status === 'rejected' && (
                            <button
                              onClick={() => {
                                setSelectedRental(rental);
                                setFile(null);
                                setUploadMsg('');
                              }}
                              className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2.5 rounded-xl transition"
                            >
                              Upload Ulang Bukti Bayar
                            </button>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Upload */}
      {selectedRental && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold text-lg">
                  Upload Bukti Bayar
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  {selectedRental.item_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedRental(null)}
                className="text-gray-600 hover:text-white transition text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Total */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 mb-4 flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total tagihan</span>
              <span className="text-orange-500 font-bold">
                Rp {Number(selectedRental.total_price).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Preview gambar */}
            {file ? (
              <div className="relative mb-4">
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-full h-52 object-cover rounded-xl bg-gray-800"
                />
                <button
                  onClick={() => setFile(null)}
                  className="absolute top-2 right-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-lg hover:bg-gray-900 transition"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <label className="block w-full mb-4 cursor-pointer">
                <div className="border-2 border-dashed border-gray-700 hover:border-orange-500/50 rounded-xl p-8 text-center transition">
                  <p className="text-3xl mb-2">📎</p>
                  <p className="text-gray-400 text-sm font-medium">
                    Klik untuk pilih gambar
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    JPG, PNG, WEBP · Maks 2MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
            )}

            {/* Pesan */}
            {uploadMsg === 'success' ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-4 text-green-400 text-sm text-center">
                ✓ Bukti pembayaran berhasil diupload!
              </div>
            ) : uploadMsg ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-red-400 text-sm">
                {uploadMsg}
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedRental(null)}
                className="flex-1 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 py-2.5 rounded-xl text-sm transition"
              >
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {uploading ? 'Mengupload...' : 'Upload Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
