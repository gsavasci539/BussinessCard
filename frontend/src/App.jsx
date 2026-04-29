import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './pages/DashboardLayout'
import ProfilePage from './pages/dashboard/ProfilePage'
import SettingsPage from './pages/dashboard/SettingsPage'
import ServicesPage from './pages/dashboard/ServicesPage'
import SocialPage from './pages/dashboard/SocialPage'
import CompanyPage from './pages/dashboard/CompanyPage'
import AppointmentsPage from './pages/dashboard/AppointmentsPage'
import CardPage from './pages/CardPage'
import AdminLayout from './components/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminSales from './pages/admin/Sales'
import AdminIssues from './pages/admin/Issues'
import AdminRequests from './pages/admin/Requests'
import { useAuth } from './context/AuthContext'

function PrivateRoute({ children }){
  const { token } = useAuth()
  if(!token){
    return <Navigate to="/login" replace />
  }
  return children
}

function AdminPrivateRoute({ children }){
  const { token } = useAuth()
  if(!token){
    return <Navigate to="/admin/login" replace />
  }
  return children
}

function Layout({ children }){
  const { token, logout, profile } = useAuth()
  const currentPath = window.location.pathname
  
  // Check if current path is a CardPage (username route)
  const isCardPage = currentPath !== '/' && 
                    !currentPath.startsWith('/login') && 
                    !currentPath.startsWith('/register') && 
                    !currentPath.startsWith('/dashboard') && 
                    !currentPath.startsWith('/admin') &&
                    currentPath !== '/favicon.ico'
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isCardPage && (
        <header className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="font-semibold">Dijital Kartvizit</Link>
            <nav className="space-x-4">
              {token ? (
                <>
                  <Link to="/dashboard" className="text-sm">Panel</Link>
                  {profile?.role === 'admin' && (
                    <Link to="/admin/dashboard" className="text-sm">
                      Yönetim Paneli
                    </Link>
                  )}
                  <button className="text-sm text-red-600" onClick={logout}>Çıkış</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm">Giriş</Link>
                  <Link to="/register" className="text-sm">Kayıt</Link>
                </>
              )}
            </nav>
          </div>
        </header>
      )}
      <main className="flex-1">{children}</main>
      {!isCardPage && (
        <footer className="border-t py-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} Dijital Kartvizit</footer>
      )}
    </div>
  )
}

export default function App(){
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>} >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="company" element={<CompanyPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="social" element={<SocialPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
        </Route>
        <Route path="/admin">
          <Route path="login" element={<AdminLogin />} />
          <Route element={<AdminPrivateRoute><AdminLayout /></AdminPrivateRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="issues" element={<AdminIssues />} />
            <Route path="requests" element={<AdminRequests />} />
          </Route>
        </Route>
        <Route path="/:username" element={<CardPage />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}
