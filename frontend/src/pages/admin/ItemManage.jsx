import { React, useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';

const emptyForm = {
  category_id: '',
  name: '',
  description: '',
  price_per_day: '',
  stock: 1,
  image_url: '',
};

const ItemManage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // null = tambah baru
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Konfirmasi hapus
  const [deleteId, setDeleteId] = useState(null);

  async function fetchAll() {
    try {
      const [itemsRes, catRes] = await Promise.all([
        api.get('/items'),
        api.get('/categories'),
      ]);
      setItems(itemsRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await fetchAll();
    })();
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      category_id: item.category_id || '',
      name: item.name,
      description: item.description || '',
      price_per_day: item.price_per_day,
      stock: item.stock,
      image_url: item.image_url || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price_per_day) {
      setError('Nama dan harga wajib diisi');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editItem) {
        await api.put(`/items/${editItem.id}`, form);
      } else {
        await api.post('/items', form);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/items/${deleteId}`);
      setDeleteId(null);
      fetchAll();
    } catch (err) {
      console.error(err);
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
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kelola Barang</h1>
            <p className="text-gray-500 text-sm mt-1">
              {items.length} barang terdaftar
            </p>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm transition"
            onClick={openAdd}
          >
            + Tambah Barang
          </button>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Barang
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Kategori
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Harga/Hari
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Stok
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.length === 0 ? (
                <tr>
                  <td colspan={5} className="py-12 text-gray-400">
                    Belum Ada Barang
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.image_url?.startsWith('http')
                              ? item.image_url
                              : `http://localhost:5000/uploads/${item.image_url}`
                          }
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-lg bg-gray-100"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/40x40?text=?';
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.category_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      Rp {Number(item.price_per_day).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${item.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="text-xs bg-blue-50 text-blue-500 px-3 py-1 rounded-lg hover:bg-blue-100 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="text-xs bg-red-50 text-red-400 px-3 py-1 rounded-lg hover:bg-red-100 transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editItem ? 'Edit Barang' : 'Tambah Barang'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">
                  Kategori
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium">
                  Nama Barang *
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Kamera Canon EOS 80D"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium">
                  Deskripsi
                </label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat barang..."
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-medium">
                    Harga / Hari (Rp) *
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={form.price_per_day}
                    onChange={(e) =>
                      setForm({ ...form, price_per_day: e.target.value })
                    }
                    placeholder="150000"
                    min={0}
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs text-gray-500 font-medium">
                    Stok
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium">
                  URL Gambar
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                  placeholder="https://... atau nama-file.jpg"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-500 text-white rounded-lg py-2 text-sm hover:bg-blue-600 transition disabled:opacity-40"
              >
                {saving
                  ? 'Menyimpan...'
                  : editItem
                    ? 'Simpan Perubahan'
                    : 'Tambah Barang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Hapus Barang?
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Tindakan ini tidak bisa dibatalkan. Barang yang sedang disewa
              tidak disarankan untuk dihapus.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm hover:bg-red-600 transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemManage;
