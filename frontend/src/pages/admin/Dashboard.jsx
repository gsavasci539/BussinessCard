import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSales: 0,
    totalRevenue: 0,
    openIssues: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Helper function to safely fetch data with default values
        const safeFetch = async (endpoint, defaultValue) => {
          try {
            const response = await api.get(endpoint);
            return response.data;
          } catch (error) {
            console.warn(`Failed to fetch ${endpoint}:`, error);
            return defaultValue;
          }
        };
        
        // Fetch all stats in parallel
        const [usersData, salesData, issuesData, requestsData] = await Promise.all([
          safeFetch('/api/admin/stats/users', { total_users: 0, active_users: 0 }),
          safeFetch('/api/admin/stats/sales', { total_sales: 0, total_revenue: 0 }),
          safeFetch('/api/admin/stats/issues', { open_issues: 0 }),
          safeFetch('/api/admin/stats/requests', { pending_requests: 0 }),
        ]);
        
        setStats({
          totalUsers: usersData.total_users || 0,
          activeUsers: usersData.active_users || 0,
          totalSales: salesData.total_sales || 0,
          totalRevenue: salesData.total_revenue || 0,
          openIssues: issuesData.open_issues || 0,
          pendingRequests: requestsData.pending_requests || 0,
        });
        
        // Clear any previous errors if all or some stats were loaded
        setError('');
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('İstatistikler yüklenirken bir hata oluştu. Bazı veriler gösterilemiyor olabilir.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Genel Bakış</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Toplam Kullanıcı" 
          value={stats.totalUsers} 
          change={5} 
          icon="👥"
          color="indigo"
        />
        <StatCard 
          title="Aktif Kullanıcılar" 
          value={stats.activeUsers} 
          change={3} 
          icon="✅"
          color="green"
        />
        <StatCard 
          title="Toplam Satış" 
          value={stats.totalSales} 
          change={12} 
          icon="💰"
          color="yellow"
        />
        <StatCard 
          title="Toplam Gelir" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          change={8} 
          icon="💵"
          color="blue"
        />
        <StatCard 
          title="Açık Sorunlar" 
          value={stats.openIssues} 
          change={-2} 
          icon="⚠️"
          color="red"
        />
        <StatCard 
          title="Bekleyen Talepler" 
          value={stats.pendingRequests} 
          change={1} 
          icon="📝"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Son Kullanıcılar</h3>
          <p className="text-gray-600">Burada son kayıt olan kullanıcılar listelenecek</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Son Satışlar</h3>
          <p className="text-gray-600">Burada son yapılan satışlar listelenecek</p>
        </div>
      </div>
    </div>
  );
}

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
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${bgColors[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
      <div className="mt-4">
        <span className={`text-sm font-medium ${changeColor}`}>
          {changeIcon} {Math.abs(change)}% 
          <span className="text-gray-500 ml-1">geçen aya göre</span>
        </span>
      </div>
    </div>
  );
}
