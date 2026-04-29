import { useState, useEffect } from 'react';
import { api } from '../../api/client';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: 'pending',
    type: 'all',
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchRequests();
  }, [currentPage, filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // This is a mock response - replace with actual API call
      const response = await api.get('/api/admin/requests', {
        params: {
          page: currentPage,
          page_size: itemsPerPage,
          status: filters.status !== 'all' ? filters.status : undefined,
          type: filters.type !== 'all' ? filters.type : undefined,
        },
      });
      
      setRequests(response.data.items || []);
      setTotalPages(Math.ceil((response.data.total || 0) / itemsPerPage));
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Talepler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const updateRequestStatus = async (id, status, responseNote = '') => {
    try {
      await api.put(`/api/admin/requests/${id}`, { 
        status,
        response_note: responseNote 
      });
      fetchRequests();
    } catch (err) {
      console.error('Failed to update request status:', err);
      setError('Durum güncellenirken bir hata oluştu');
    }
  };

  const StatusBadge = ({ status }) => {
    const statusMap = {
      pending: { text: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
      in_review: { text: 'İnceleniyor', color: 'bg-blue-100 text-blue-800' },
      approved: { text: 'Onaylandı', color: 'bg-green-100 text-green-800' },
      rejected: { text: 'Reddedildi', color: 'bg-red-100 text-red-800' },
      completed: { text: 'Tamamlandı', color: 'bg-purple-100 text-purple-800' },
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status]?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusMap[status]?.text || 'Bilinmiyor'}
      </span>
    );
  };

  const TypeBadge = ({ type }) => {
    const typeMap = {
      account: { text: 'Hesap', color: 'bg-blue-100 text-blue-800' },
      feature: { text: 'Özellik', color: 'bg-green-100 text-green-800' },
      bug: { text: 'Hata', color: 'bg-red-100 text-red-800' },
      other: { text: 'Diğer', color: 'bg-gray-100 text-gray-800' },
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeMap[type]?.color || 'bg-gray-100 text-gray-800'}`}>
        {typeMap[type]?.text || 'Diğer'}
      </span>
    );
  };

  const handleAction = async (requestId, action) => {
    if (action === 'approve') {
      const note = prompt('Onay notu ekleyin (isteğe bağlı):', '');
      if (note !== null) { // User didn't cancel
        await updateRequestStatus(requestId, 'approved', note);
      }
    } else if (action === 'reject') {
      const note = prompt('Red sebebini yazın (zorunlu):', '');
      if (note && note.trim() !== '') {
        await updateRequestStatus(requestId, 'rejected', note);
      } else if (note !== null) {
        alert('Red sebebi boş olamaz');
      }
    } else if (action === 'complete') {
      const note = prompt('Tamamlandı notu ekleyin (isteğe bağlı):', '');
      if (note !== null) {
        await updateRequestStatus(requestId, 'completed', note);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Talep Yönetimi</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <select
                id="status-filter"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Tümü</option>
                <option value="pending">Bekleyenler</option>
                <option value="in_review">İncelenenler</option>
                <option value="approved">Onaylananlar</option>
                <option value="rejected">Reddedilenler</option>
                <option value="completed">Tamamlananlar</option>
              </select>
            </div>
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">Talep Türü</label>
              <select
                id="type-filter"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Tümü</option>
                <option value="account">Hesap</option>
                <option value="feature">Özellik</option>
                <option value="bug">Hata</option>
                <option value="other">Diğer</option>
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchRequests}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium h-10"
              disabled={loading}
            >
              {loading ? 'Yükleniyor...' : 'Uygula'}
            </button>
          </div>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gönderen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tür
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{request.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.requested_by?.name || 'Bilinmiyor'}</div>
                      <div className="text-sm text-gray-500">{request.requested_by?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TypeBadge type={request.type} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => {
                          // Implement view details
                          alert(`Talep detayları gösterilecek: ${request.id}\n\nAçıklama: ${request.description}`);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Detay
                      </button>
                      
                      {request.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleAction(request.id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Onayla
                          </button>
                          <button 
                            onClick={() => handleAction(request.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reddet
                          </button>
                        </>
                      )}
                      
                      {request.status === 'approved' && (
                        <button 
                          onClick={() => handleAction(request.id, 'complete')}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Tamamlandı
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    {loading ? 'Yükleniyor...' : 'Gösterilecek talep bulunamadı'}
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
