import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon, TrashIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { api } from '../../api/client';

export default function AppointmentsPage() {
  const { token } = useAuth();
  const [appointmentForms, setAppointmentForms] = useState([]);
  const [newForm, setNewForm] = useState({ name: '', url: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load appointment forms from backend API on component mount
  const loadAppointments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('/api/appointments');
      if (response.data) {
        setAppointmentForms(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Randevu formları yüklenirken bir hata oluştu.');
      // Fallback to localStorage if API fails (for development)
      try {
        const savedForms = JSON.parse(localStorage.getItem('appointmentForms') || '[]');
        setAppointmentForms(savedForms);
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadAppointments();
  }, []);

  const handleAddForm = async (e) => {
    e.preventDefault();
    if (!newForm.name.trim() || !newForm.url.trim()) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    // Basic URL validation
    try {
      new URL(newForm.url); // This will throw if URL is invalid
    } catch (err) {
      setError('Lütfen geçerli bir URL giriniz.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/appointments', {
        name: newForm.name,
        url: newForm.url,
        is_active: true
      });
      
      if (response.data) {
        setNewForm({ name: '', url: '' });
        setSuccess('Randevu formu başarıyla eklendi.');
        setTimeout(() => setSuccess(''), 3000);
        // Refresh the appointments list
        await loadAppointments();
      }
    } catch (err) {
      console.error('Error adding appointment:', err);
      setError('Randevu formu eklenirken bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteForm = async (id) => {
    if (!window.confirm('Bu randevu formunu silmek istediğinize emin misiniz?')) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // First try to delete from the backend
      try {
        await api.delete(`/api/appointments/${id}`);
      } catch (err) {
        console.error('Error deleting from backend, trying soft delete:', err);
        // If delete fails, try to update is_active to false
        await api.put(`/api/appointments/${id}`, { is_active: false });
      }
      
      // Update the UI
      setAppointmentForms(prevForms => prevForms.filter(form => form.id !== id));
      setSuccess('Randevu formu başarıyla silindi.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError('Randevu formu silinirken bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Randevu Formları</h2>
        <p className="text-sm text-gray-500 mt-1">
          Müşterilerinizin randevu alabilmesi için Google Forms veya diğer form bağlantılarınızı ekleyin.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
          <p>{success}</p>
        </div>
      )}

      {/* Add New Form */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="font-medium text-gray-800 mb-3">Yeni Randevu Formu Ekle</h3>
        <form onSubmit={handleAddForm} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="formName" className="block text-sm font-medium text-gray-700 mb-1">
                Form Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="formName"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Örnek: Danışmanlık Randevusu"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="formUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Form URL <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <input
                  type="url"
                  id="formUrl"
                  value={newForm.url}
                  onChange={(e) => setNewForm({ ...newForm, url: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="https://forms.gle/..."
                  required
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-r-md transition-colors flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Form List */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="font-medium text-gray-800 mb-3">Mevcut Randevu Formları</h3>
        
        {appointmentForms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Henüz hiç randevu formu eklenmemiş.</p>
            <p className="text-sm mt-1">Yukarıdaki formu kullanarak yeni bir randevu formu ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form Adı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointmentForms.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {form.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="truncate max-w-xs">
                        {form.url}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => openInNewTab(form.url)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Formu Görüntüle"
                      >
                        <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteForm(form.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Sil"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-medium text-blue-800">Nasıl Kullanılır?</h3>
        <ol className="mt-2 text-sm text-blue-700 list-decimal list-inside space-y-1">
          <li>Google Forms veya başka bir form aracı kullanarak bir randevu formu oluşturun.</li>
          <li>Formunuzu yayınladıktan sonra paylaşılabilir bağlantıyı kopyalayın.</li>
          <li>Yukarıdaki forma formunuzun adını ve URL'sini girerek ekleyin.</li>
          <li>Eklediğiniz formlar aşağıda listelenecektir. Formu görüntülemek veya silmek için ilgili butonları kullanabilirsiniz.</li>
        </ol>
      </div>
    </div>
  );
}
