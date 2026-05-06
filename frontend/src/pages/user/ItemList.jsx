import { useEffect, useState, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import ItemCard from '../../components/ItemCard';
import api from '../../api/axios';

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/items'), api.get('/categories')])
      .then(([itemsRes, catRes]) => {
        setItems(itemsRes.data);
        setCategories(catRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(q) ||
        item.category_name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);
      const matchCategory =
        activeCategory === 'Semua' || item.category_name === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [search, activeCategory, items]);

  const availableCount = items.filter((i) => i.stock > 0).length;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Hero */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-white text-2xl font-bold mb-1">
                Temukan Peralatan Kamu
              </h1>
              <p className="text-gray-500 text-sm">
                <span className="text-orange-500 font-medium">
                  {availableCount} barang
                </span>{' '}
                tersedia untuk disewa sekarang
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Cari barang atau kategori..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Kategori */}
          <div className="flex gap-2 mt-6 flex-wrap">
            {['Semua', ...categories.map((c) => c.name)].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeCategory === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          /* Skeleton loader */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-800 rounded-lg w-3/4" />
                  <div className="h-3 bg-gray-800 rounded-lg w-full" />
                  <div className="h-3 bg-gray-800 rounded-lg w-2/3" />
                  <div className="h-9 bg-gray-800 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-white font-semibold mb-1">
              Barang tidak ditemukan
            </p>
            <p className="text-gray-500 text-sm mb-5">
              Coba kata kunci atau kategori lain
            </p>
            <button
              onClick={() => {
                setSearch('');
                setActiveCategory('Semua');
              }}
              className="text-sm bg-gray-800 text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-700 transition border border-gray-700"
            >
              Reset filter
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-600 text-sm mb-5">
              Menampilkan{' '}
              <span className="text-gray-400 font-medium">
                {filtered.length}
              </span>{' '}
              barang
              {activeCategory !== 'Semua' && (
                <span>
                  {' '}
                  di kategori{' '}
                  <span className="text-orange-500">{activeCategory}</span>
                </span>
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
