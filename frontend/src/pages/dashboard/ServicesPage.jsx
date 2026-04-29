import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/client'

// Persist services under profile.social_links.services
export default function ServicesPage(){
  const { profile, setProfile } = useAuth()
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  useEffect(() => {
    if(profile){
      const services = profile.social_links?.services || []
      setItems(Array.isArray(services) ? services : [])
    }
  }, [profile])

  const addItem = async (e) => {
    e.preventDefault()
    if(!name) return
    const next = [...items, { id: Date.now(), name, desc }]
    setItems(next)
    setName(''); setDesc('')
    await api.put('/api/profile', { social_links: { services: next }})
    const res = await api.get('/api/profile')
    setProfile(res.data)
  }
  const remove = async (id) => {
    const next = items.filter(x=>x.id!==id)
    setItems(next)
    await api.put('/api/profile', { social_links: { services: next }})
    const res = await api.get('/api/profile')
    setProfile(res.data)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Hizmet Yönetimi</h2>
      <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="input" placeholder="Hizmet adı" value={name} onChange={e=>setName(e.target.value)} autoComplete="off" spellCheck="false" />
        <input className="input" placeholder="Açıklama" value={desc} onChange={e=>setDesc(e.target.value)} autoComplete="off" spellCheck="false" />
        <button className="btn">Ekle</button>
      </form>
      <div className="border rounded-md">
        {items.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">Henüz hizmet eklenmedi.</div>
        ) : (
          <ul className="divide-y">
            {items.map(s => (
              <li key={s.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-gray-600">{s.desc}</div>
                </div>
                <button className="btn" onClick={()=>remove(s.id)}>Sil</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
