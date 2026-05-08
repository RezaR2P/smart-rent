import { useNavigate } from 'react-router-dom';

const ItemCard = ({ item }) => {
  const navigate = useNavigate();
  if (!item) return null;

  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 flex flex-col">
      {/* Gambar */}
      <div className="relative overflow-hidden bg-gray-800 h-48">
        <img
          src={
            item.image_url?.startsWith('http')
              ? item.image_url
              : `/uploads/${item.image_url}`
          }
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              'https://placehold.co/400x200/1f2937/4b5563?text=No+Image';
          }}
        />
        {/* Badge stok */}
        <div className="absolute top-3 right-3">
          {item.stock > 0 ? (
            <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm border border-green-500/20">
              Tersedia
            </span>
          ) : (
            <span className="bg-red-500/20 text-red-400 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm border border-red-500/20">
              Habis
            </span>
          )}
        </div>
        {/* Badge kategori */}
        {item.category_name && (
          <div className="absolute top-3 left-3">
            <span className="bg-gray-900/80 text-gray-400 text-xs px-2.5 py-1 rounded-full backdrop-blur-sm border border-gray-700">
              {item.category_name}
            </span>
          </div>
        )}
      </div>

      {/* Konten */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-4 flex-1">
          {item.description || 'Tidak ada deskripsi'}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-orange-500 font-bold text-base">
              Rp {Number(item.price_per_day).toLocaleString('id-ID')}
            </span>
            <span className="text-gray-600 text-xs"> / hari</span>
          </div>
          <span className="text-gray-600 text-xs">Stok: {item.stock}</span>
        </div>

        <button
          onClick={() => navigate(`/items/${item.id}`)}
          disabled={item.stock === 0}
          className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/20"
        >
          {item.stock > 0 ? 'Lihat Detail' : 'Stok Habis'}
        </button>
      </div>
    </div>
  );
};

export default ItemCard;
