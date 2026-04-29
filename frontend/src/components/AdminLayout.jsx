import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { profile, isAdmin } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log('AdminLayout Debug:', {
    profile,
    isAdmin,
    profileRole: profile?.role,
    hasToken: !!localStorage.getItem('token'),
    hasAccessToken: !!localStorage.getItem('access_token')
  });

  // Redirect to admin login if not authenticated as admin
  if (!isAdmin) {
    console.log('AdminLayout: Redirecting to login because isAdmin is false');
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const menuItems = [
    { path: '/admin/dashboard', label: 'Genel Bakış', icon: '📊' },
    { path: '/admin/users', label: 'Kullanıcılar', icon: '👥' },
    { path: '/admin/sales', label: 'Satışlar', icon: '💰' },
    { path: '/admin/issues', label: 'Sorunlar', icon: '⚠️' },
    { path: '/admin/requests', label: 'Talepler', icon: '📝' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Admin Paneli</h1>
        </div>
        <nav className="mt-6">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className="px-4 py-2">
                <Link
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
