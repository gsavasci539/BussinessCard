import { useState, useEffect } from 'react';
import { api } from '../../api/client';

export default function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchIssues();
  }, [currentPage, filters]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      // This is a mock response - replace with actual API call
      const response = await api.get('/api/admin/issues', {
        params: {
          page: currentPage,
          page_size: itemsPerPage,
          status: filters.status !== 'all' ? filters.status : undefined,
          priority: filters.priority !== 'all' ? filters.priority : undefined,
        },
      });
      
      setIssues(response.data.items || []);
      setTotalPages(Math.ceil((response.data.total || 0) / itemsPerPage));
    } catch (err) {
      console.error('Failed to fetch issues:', err);
      setError('Sorunlar yüklenirken bir hata oluştu');
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

  const updateIssueStatus = async (id, status) => {
    try {
      await api.put(`/api/admin/issues/${id}`, { status });
      fetchIssues();
    } catch (err) {
      console.error('Failed to update issue status:', err);
      setError('Durum güncellenirken bir hata oluştu');
    }
  };

  const PriorityBadge = ({ priority }) => {
    const priorityMap = {
      high: { text: 'Yüksek', color: 'bg-red-100 text-red-800' },
      medium: { text: 'Orta', color: 'bg-yellow-100 text-yellow-800' },
      low: { text: 'Düşük', color: 'bg-blue-100 text-blue-800' },
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityMap[priority]?.color || 'bg-gray-100 text-gray-800'}`}>
        {priorityMap[priority]?.text || 'Belirtilmemiş'}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    const statusMap = {
      open: { text: 'Açık', color: 'bg-blue-100 text-blue-800' },
      in_progress: { text: 'İşlemde', color: 'bg-yellow-100 text-yellow-800' },
      resolved: { text: 'Çözüldü', color: 'bg-green-100 text-green-800' },
      closed: { text: 'Kapandı', color: 'bg-gray-100 text-gray-800' },
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status]?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusMap[status]?.text || 'Bilinmiyor'}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sorun Yönetimi</h1>
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
                <option value="open">Açık</option>
                <option value="in_progress">İşlemde</option>
                <option value="resolved">Çözüldü</option>
                <option value="closed">Kapandı</option>
              </select>
            </div>
            <div>
              <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
              <select
                id="priority-filter"
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Tümü</option>
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchIssues}
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
                  Açan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Öncelik
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
              {issues.length > 0 ? (
                issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{issue.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{issue.reported_by?.name || 'Bilinmiyor'}</div>
                      <div className="text-sm text-gray-500">{issue.reported_by?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          // Implement view details
                          alert(`Detaylar gösterilecek: ${issue.id}`);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Görüntüle
                      </button>
                      {issue.status !== 'closed' && (
                        <button 
                          onClick={() => updateIssueStatus(issue.id, 'closed')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Kapat
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    {loading ? 'Yükleniyor...' : 'Gösterilecek sorun bulunamadı'}
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
