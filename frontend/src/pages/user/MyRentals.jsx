import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';

const statusConfig = {
  pending: {
    label: 'Menunggu Pembayaran',
    color: 'bg-yellow-50 text-yellow-600',
  },
  active: { label: 'Aktif', color: 'bg-green-50 text-green-600' },
  completed: { label: 'Selesai', color: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-50 text-red-400' },
};

const MyRentals = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk modal upload
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
      setUploadMsg('Bukti pembayaran berhasil diupload!');
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Sewa Saya</h1>
          <p className="text-gray-500 text-sm mt-1">
            Riwayat dan Status Sewaan Anda
          </p>
        </div>

        {rentals.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="mb-4">Belum ada riwayat sewa</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition"
            >
              Mulai Sewa
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map((rental) => {
              const status =
                statusConfig[rental.status] || statusConfig.pending;
              return (
                <div
                  key={rental.id}
                  className="bg-white rounded-xl shadow-sm p-5"
                >
                  <div className="flex items-start gap-4">
                    {/* Gambar */}
                    <img
                      src={
                        rental.image_url?.startsWith('http')
                          ? rental.image_url
                          : `http://localhost:5000/uploads/${rental.image_url}`
                      }
                      alt={rental.item_name}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100 shrink-0"
                      onError={(e) => {
                        e.target.src =
                          'https://placehold.co/80x80?text=No+Image';
                      }}
                    />

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-800">
                          {rental.item_name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                        <p>
                          📅 {rental.start_date?.split('T')[0]} →{' '}
                          {rental.end_date?.split('T')[0]}
                        </p>
                        <p>
                          💰 Total:{' '}
                          <span className="font-semibold text-gray-700">
                            Rp{' '}
                            {Number(rental.total_price).toLocaleString('id-ID')}
                          </span>
                        </p>
                      </div>
                      {/* Info status pembayaran */}
                      {rental.status === 'pending' &&
                        rental.payment_status === 'pending' && (
                          <p className="mt-2 text-xs text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg">
                            ⏳ Bukti bayar sedang menunggu verifikasi admin
                          </p>
                        )}
                      {/* Tombol upload — hanya kalau status pending */}
                      {rental.status === 'pending' &&
                        rental.payment_status === 'rejected' && (
                          <div className="mt-2">
                            <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg mb-2">
                              ❌ Bukti bayar ditolak, silakan upload ulang
                            </p>
                            <button
                              onClick={() => {
                                setSelectedRental(rental);
                                setFile(null);
                                setUploadMsg('');
                              }}
                              className="text-sm bg-blue-500 text-white px-4 py-1.5 rounded-lg hover:bg-blue-600 transition"
                            >
                              Upload Ulang
                            </button>
                          </div>
                        )}
                      {rental.status === 'pending' &&
                        !rental.payment_status && (
                          <button
                            onClick={() => {
                              setSelectedRental(rental);
                              setFile(null);
                              setUploadMsg('');
                            }}
                            className="mt-3 text-sm bg-blue-500 text-white px-4 py-1.5 rounded-lg hover:bg-blue-600 transition"
                          >
                            Upload Bukti Bayar
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

      {/* Modal Upload */}
      {selectedRental && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Upload Bukti Bayar
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {selectedRental.item_name} — Rp{' '}
              {Number(selectedRental.total_price).toLocaleString('id-ID')}
            </p>

            {/* Preview gambar */}
            {file && (
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-full h-48 object-cover rounded-lg mb-4 bg-gray-100"
              />
            )}

            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-500 border rounded-lg px-3 py-2 mb-4"
              onChange={(e) => setFile(e.target.files[0])}
            />

            {uploadMsg && (
              <p
                className={`text-sm mb-3 ${uploadMsg.includes('berhasil') ? 'text-green-600' : 'text-red-500'}`}
              >
                {uploadMsg}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedRental(null)}
                className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1 bg-blue-500 text-white rounded-lg py-2 text-sm hover:bg-blue-600 transition disabled:opacity-40"
              >
                {uploading ? 'Mengupload...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRentals;
