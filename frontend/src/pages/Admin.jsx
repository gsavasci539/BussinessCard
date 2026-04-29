import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function Admin(){
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  if(profile && profile.role !== 'admin'){
    return <Navigate to="/dashboard" replace />
  }

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/admin/users', { 
        params: { 
          q: q || undefined, 
          page, 
          page_size: pageSize 
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      setUsers(res.data.items)
      setTotal(res.data.total)
    } catch (err) {
      if (err.response?.status === 401) {
        logout()
        navigate('/login')
        toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.')
      } else {
        setError('Kullanıcılar yüklenirken bir hata oluştu')
        console.error('Error loading users:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, pageSize])

  const updateField = async (id, patch) => {
    try {
      await api.put(`/admin/users/${id}`, patch, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      await load()
      toast.success('Kullanıcı başarıyla güncellendi')
    } catch (err) {
      console.error('Error updating user:', err)
      toast.error('Kullanıcı güncellenirken bir hata oluştu')
    }
  }

  const block = async (id) => { 
    try {
      await api.post(`/admin/users/${id}/block`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      await load()
      toast.success('Kullanıcı başarıyla engellendi')
    } catch (err) {
      console.error('Error blocking user:', err)
      toast.error('Kullanıcı engellenirken bir hata oluştu')
    }
  }

  const unblock = async (id) => { 
    try {
      await api.post(`/admin/users/${id}/unblock`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      await load()
      toast.success('Kullanıcının engeli kaldırıldı')
    } catch (err) {
      console.error('Error unblocking user:', err)
      toast.error('Kullanıcının engeli kaldırılırken bir hata oluştu')
    }
  }

  const remove = async (id) => { 
    if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await api.delete(`/admin/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        })
        await load()
        toast.success('Kullanıcı başarıyla silindi')
      } catch (err) {
        console.error('Error deleting user:', err)
        toast.error('Kullanıcı silinirken bir hata oluştu')
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-semibold">Admin - Kullanıcı Yönetimi</h1>
        <div className="flex items-center gap-2">
          <input className="input" placeholder="Ara (kullanıcı, e-posta, ad)" value={q} onChange={(e)=>setQ(e.target.value)} />
          <button className="btn" onClick={() => { setPage(1); load() }} disabled={loading}>Ara</button>
          <button className="btn" onClick={load} disabled={loading}>Yenile</button>
        </div>
      </div>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      <div className="overflow-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Kullanıcı Adı</th>
              <th className="p-2">E-posta</th>
              <th className="p-2">Ad Soyad</th>
              <th className="p-2">Rol</th>
              <th className="p-2">Durum</th>
              <th className="p-2">Ziyaret</th>
              <th className="p-2">Son Ziyaret</th>
              <th className="p-2">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.id}</td>
                <td className="p-2 font-mono">{u.username}</td>
                <td className="p-2">
                  <input className="input" value={u.email || ''} onChange={(e)=>setUsers(prev=>prev.map(x=>x.id===u.id?{...x,email:e.target.value}:x))} />
                </td>
                <td className="p-2">
                  <input className="input" value={u.full_name || ''} onChange={(e)=>setUsers(prev=>prev.map(x=>x.id===u.id?{...x,full_name:e.target.value}:x))} />
                </td>
                <td className="p-2">
                  <select className="input" value={u.role} onChange={(e)=>setUsers(prev=>prev.map(x=>x.id===u.id?{...x,role:e.target.value}:x))}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-2">
                  {u.is_active ? <span className="text-green-700">Aktif</span> : <span className="text-gray-500">Engelli</span>}
                </td>
                <td className="p-2">{u.visit_count ?? 0}</td>
                <td className="p-2">{u.last_visited_at ? new Date(u.last_visited_at).toLocaleString() : '-'}</td>
                <td className="p-2 space-x-2 whitespace-nowrap">
                  <button className="btn" onClick={()=>updateField(u.id, { email: u.email, full_name: u.full_name, role: u.role })}>Kaydet</button>
                  {u.is_active ? (
                    <button className="btn" onClick={()=>block(u.id)}>Engelle</button>
                  ) : (
                    <button className="btn" onClick={()=>unblock(u.id)}>Aktif Et</button>
                  )}
                  <button className="btn bg-red-600 hover:bg-red-700" onClick={()=>remove(u.id)}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-gray-600">Toplam: {total}</div>
        <div className="flex items-center gap-2">
          <button className="btn" onClick={()=>setPage(p=>Math.max(1, p-1))} disabled={page===1}>Önceki</button>
          <span className="text-sm">Sayfa {page}</span>
          <button className="btn" onClick={()=>setPage(p=>p+1)} disabled={(page*pageSize)>=total}>Sonraki</button>
          <select className="input" value={pageSize} onChange={(e)=>{ setPageSize(parseInt(e.target.value)); setPage(1) }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  )
}
