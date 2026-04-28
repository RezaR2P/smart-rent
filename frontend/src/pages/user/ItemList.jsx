import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import ItemCard from '../../components/ItemCard';
import api from '../../api/axios';

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/items')
      .then((res) => {
        setItems(res.data);
        setFiltered(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category_name?.toLowerCase().includes(q)
      )
    );
  }, [search, items]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Daftar Barang Sewa
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Temukan alat yang kamu butuhkan
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Cari barang atau kategori..."
            className="w-full max-w-md border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            Memuat barang...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            Barang tidak ditemukan
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
