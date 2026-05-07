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
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
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

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 animate-pulse flex gap-4"
              >
                <div className="w-12 h-12 bg-gray-800 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-1/3" />
                  <div className="h-3 bg-gray-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold mb-1">
              Kelola Barang
            </h1>
            <p className="text-gray-500 text-sm">
              {items.length} barang terdaftar
            </p>
          </div>
          <button
            onClick={openAdd}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition flex items-center gap-2 w-fit"
          >
            <span className="text-base leading-none">+</span> Tambah Barang
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Cari barang atau kategori..."
            className="w-full sm:w-80 bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabel */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Header tabel */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-800 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-5">Barang</div>
            <div className="col-span-2">Kategori</div>
            <div className="col-span-2">Harga/Hari</div>
            <div className="col-span-1 text-center">Stok</div>
            <div className="col-span-2 text-right">Aksi</div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-3xl mb-3">📦</p>
              <p className="text-white font-medium mb-1">
                {search ? 'Barang tidak ditemukan' : 'Belum ada barang'}
              </p>
              <p className="text-gray-500 text-sm">
                {search
                  ? 'Coba kata kunci lain'
                  : 'Tambahkan barang pertama kamu'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-800/50 transition"
                >
                  {/* Nama + gambar */}
                  <div className="col-span-5 flex items-center gap-3">
                    <img
                      src={
                        item.image_url?.startsWith('http')
                          ? item.image_url
                          : `http://localhost:5000/uploads/${item.image_url}`
                      }
                      alt={item.name}
                      className="w-11 h-11 object-cover rounded-xl bg-gray-800 shrink-0"
                      onError={(e) => {
                        e.target.src =
                          'https://placehold.co/44x44/1f2937/4b5563?text=?';
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {item.description || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Kategori */}
                  <div className="col-span-2">
                    <span className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-lg border border-gray-700">
                      {item.category_name || '-'}
                    </span>
                  </div>

                  {/* Harga */}
                  <div className="col-span-2">
                    <span className="text-orange-500 font-semibold text-sm">
                      Rp {Number(item.price_per_day).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Stok */}
                  <div className="col-span-1 text-center">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        item.stock > 0
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {item.stock}
                    </span>
                  </div>

                  {/* Aksi */}
                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-xs bg-gray-800 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition border border-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition border border-red-500/20"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">
                {editItem ? 'Edit Barang' : 'Tambah Barang'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-white transition text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-2">
                  Kategori
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
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
                <label className="block text-gray-400 text-xs font-medium mb-2">
                  Nama Barang *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kamera Canon EOS 80D"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-medium mb-2">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi singkat barang..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition resize-none"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-2">
                    Harga / Hari (Rp) *
                  </label>
                  <input
                    type="number"
                    placeholder="150000"
                    min={0}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                    value={form.price_per_day}
                    onChange={(e) =>
                      setForm({ ...form, price_per_day: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-2">
                    Stok
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-medium mb-2">
                  URL Gambar
                </label>
                <input
                  type="text"
                  placeholder="https://... atau nama-file.jpg"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                />
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="preview"
                    className="mt-2 w-full h-32 object-cover rounded-xl bg-gray-800"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mt-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 py-2.5 rounded-xl text-sm transition"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-40"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-2xl mb-4">
              🗑️
            </div>
            <h2 className="text-white font-bold text-lg mb-1">Hapus Barang?</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Tindakan ini tidak bisa dibatalkan. Pastikan barang tidak sedang
              aktif disewa.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 py-2.5 rounded-xl text-sm transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium transition"
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
