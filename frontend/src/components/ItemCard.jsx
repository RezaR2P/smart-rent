import { useNavigate } from 'react-router-dom';

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
      <img
        src={
          item.image_url?.startsWith('http')
            ? item.image_url
            : `http://localhost:5000/uploads/${item.image_url}`
        }
        alt={item.name}
        className="w-full h-48 object-cover bg-gray-100"
        onError={(e) => {
          e.target.src = 'https://placehold.co/400x200?text=No+Image';
        }}
      />
      <div className="p-4">
        <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
          {item.category_name || 'Umum'}
        </span>
        <h3 className="font-semibold text-gray-800 mt-2 mb-1">{item.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-blue-600 font-bold">
              Rp {Number(item.price_per_day).toLocaleString('id-ID')}
            </span>
            <span className="text-gray-400 text-xs"> / hari</span>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${item.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}
          >
            {item.stock > 0 ? `Stok: ${item.stock}` : 'Habis'}
          </span>
        </div>
        <button
          onClick={() => navigate(`/items/${item.id}`)}
          disabled={item.stock === 0}
          className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg text-sm hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {item.stock > 0 ? 'Lihat Detail' : 'Stok Habis'}
        </button>
      </div>
    </div>
  );
}
