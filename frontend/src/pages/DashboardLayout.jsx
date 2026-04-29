import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavItem({ to, icon, label }){
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition ${isActive ? 'bg-red-700 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
      end
    >
      <span className="w-5 h-5" aria-hidden>{icon}</span>
      <span className="text-sm">{label}</span>
    </NavLink>
  )
}

export default function DashboardLayout(){
  const { logout, profile } = useAuth()
  const navigate = useNavigate()
  const doLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-4">
        {/* Sidebar */}
        <aside className="md:col-span-3 lg:col-span-3">
          <div className="bg-white rounded-xl border shadow-sm p-4">
            
            <div className="space-y-1">
              <div className="text-xs text-gray-500 px-2 pb-1">Servisler</div>
              <NavItem to="/dashboard/profile" icon={<span>👤</span>} label="Profil" />
              <NavItem to="/dashboard/company" icon={<span>🏢</span>} label="İşyeri Bilgileri" />
              <NavItem to="/dashboard/settings" icon={<span>⚙️</span>} label="Ayarlar" />
              <NavItem to="/dashboard/services" icon={<span>🧰</span>} label="Hizmet Yönetimi" />
              <NavItem to="/dashboard/social" icon={<span>📣</span>} label="Sosyal Medya" />
              <NavItem to="/dashboard/appointments" icon={<span>📅</span>} label="Randevu Formları" />
              <div className="text-xs text-gray-500 px-2 pt-3">Diğer</div>
              <button className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 w-full text-left" onClick={doLogout}>
                <span>✖️</span><span className="text-sm">Güvenli Çıkış</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <section className="md:col-span-9 lg:col-span-9">
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  )
}
