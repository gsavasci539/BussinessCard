import { useState, useEffect } from 'react';
import { api } from '../../api/client';

export default function AdminSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchSales();
  }, [currentPage, dateRange]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      // This is a mock response - replace with actual API call
      const response = await api.get('/api/admin/sales', {
        params: {
          page: currentPage,
          page_size: itemsPerPage,
          start_date: dateRange.start,
          end_date: dateRange.end,
        },
      });
      
      setSales(response.data.items || []);
      setTotalPages(Math.ceil((response.data.total || 0) / itemsPerPage));
    } catch (err) {
      console.error('Failed to fetch sales:', err);
      setError('Satış verileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = () => {
    // Implement export functionality
    alert('Dışa aktarma işlemi başlatılıyor...');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Satış Yönetimi</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className="border rounded px-2 py-1 text-sm"
            />
            <span>-</span>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <button
            onClick={fetchSales}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Yükleniyor...' : 'Filtrele'}
          </button>
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Dışa Aktar
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Toplam Satış" value="₺24,560" change={8.5} icon="💰" color="green" />
          <StatCard title="Toplam Sipariş" value="128" change={12} icon="📦" color="blue" />
          <StatCard title="Ort. Sipariş Tutarı" value="₺192" change={-2.3} icon="📊" color="purple" />
          <StatCard title="Yeni Müşteri" value="42" change={5.2} icon="👥" color="indigo" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürünler
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{sale.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sale.customer_name}</div>
                      <div className="text-sm text-gray-500">{sale.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="line-clamp-2">
                        {sale.products?.map(p => p.name).join(', ') || 'Bilgi yok'}
                      </div>
                      {sale.product_count > 2 && (
                        <span className="text-xs text-gray-500">+{sale.product_count - 2} ürün daha</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {sale.amount?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                        sale.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        sale.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {sale.status === 'completed' ? 'Tamamlandı' :
                         sale.status === 'processing' ? 'İşleniyor' :
                         sale.status === 'cancelled' ? 'İptal Edildi' : 'Bekliyor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        Detay
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        Yazdır
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    {loading ? 'Yükleniyor...' : 'Gösterilecek satış bulunamadı'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50"
            >
              Önceki
            </button>
            <span className="text-sm text-gray-700">
              Sayfa {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Reuse the StatCard component from Dashboard.jsx
function StatCard({ title, value, change, icon, color }) {
  const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
  const changeIcon = change > 0 ? '↑' : change < 0 ? '↓' : '';
  
  const bgColors = {
    indigo: 'bg-indigo-100 text-indigo-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
        <div className={`p-2 rounded-full ${bgColors[color]}`}>
          <span className="text-lg">{icon}</span>
        </div>
      </div>
      <div className="mt-2">
        <span className={`text-xs font-medium ${changeColor}`}>
          {changeIcon} {Math.abs(change)}% 
          <span className="text-gray-500 ml-1">geçen aya göre</span>
        </span>
      </div>
    </div>
  );
}
