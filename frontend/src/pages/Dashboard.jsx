import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api, API_URL } from '../api/client'

export default function Dashboard(){
  const { profile, setProfile } = useAuth()
  const [form, setForm] = useState({ full_name: '', title: '', company: '', phone: '', website: '', social_links: {}, theme: {} })
  const [map, setMap] = useState({ address: '', latitude: '', longitude: ''})
  const [pwd, setPwd] = useState({ old_password: '', new_password: '' })
  const [pwdMsg, setPwdMsg] = useState('')
  const fileRef = useRef()

  const theme = form.theme || {}
  const setTheme = (patch) => setForm(prev => ({ ...prev, theme: { ...(prev.theme || {}), ...patch } }))
  const presets = [
    { name: 'Klasik', primaryColor: '#111827', backgroundImage: '', font: 'Inter, system-ui' },
    { name: 'Okyanus', primaryColor: '#0ea5e9', backgroundImage: '', font: 'Poppins, system-ui' },
    { name: 'Günbatımı', primaryColor: '#f97316', backgroundImage: '', font: 'Nunito, system-ui' },
  ]

  useEffect(() => {
    if(profile){
      setForm({
        full_name: profile.full_name || '',
        title: profile.title || '',
        company: profile.company || '',
        phone: profile.phone || '',
        website: profile.website || '',
        social_links: profile.social_links || {},
        theme: profile.theme || {}
      })
      setMap({
        address: profile.address || '',
        latitude: profile.latitude || '',
        longitude: profile.longitude || ''
      })
    }
  }, [profile])

  const saveProfile = async (e) => {
    e.preventDefault()
    const res = await api.put('/api/profile', form)
    setProfile(res.data)
  }

  const saveMap = async (e) => {
    e.preventDefault()
    const payload = {
      address: map.address,
      latitude: map.latitude ? parseFloat(map.latitude) : null,
      longitude: map.longitude ? parseFloat(map.longitude) : null
    }
    const res = await api.put('/api/map', payload)
    setProfile(res.data)
  }

  const uploadPhoto = async (e) => {
    e.preventDefault()
    if(!fileRef.current?.files?.[0]) return
    const fd = new FormData()
    fd.append('file', fileRef.current.files[0])
    const res = await api.post('/api/profile/photo', fd)
    setProfile(res.data)
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setPwdMsg('')
    try{
      await api.put('/api/profile/password', pwd)
      setPwd({ old_password: '', new_password: '' })
      setPwdMsg('Şifre güncellendi')
    }catch(err){
      setPwdMsg('Şifre güncellenemedi')
    }
  }

  if(!profile){
    return <div className="max-w-4xl mx-auto p-6">Yükleniyor...</div>
  }

  const publicUrl = `${window.location.origin}/${profile.username}`

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-3">Profil</h2>
        <form onSubmit={saveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="input" placeholder="Ad Soyad" value={form.full_name} onChange={e=>setForm({...form, full_name: e.target.value})} />
          <input className="input" placeholder="Unvan" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
          <input className="input" placeholder="Şirket" value={form.company} onChange={e=>setForm({...form, company: e.target.value})} />
          <input className="input" placeholder="Telefon" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} />
          <input className="input" placeholder="Web sitesi" value={form.website} onChange={e=>setForm({...form, website: e.target.value})} />

          <input className="input" placeholder="LinkedIn" value={form.social_links.linkedin || ''} onChange={e=>setForm({...form, social_links: {...form.social_links, linkedin: e.target.value}})} />
          <input className="input" placeholder="Instagram" value={form.social_links.instagram || ''} onChange={e=>setForm({...form, social_links: {...form.social_links, instagram: e.target.value}})} />
          <input className="input" placeholder="GitHub" value={form.social_links.github || ''} onChange={e=>setForm({...form, social_links: {...form.social_links, github: e.target.value}})} />

          <div className="md:col-span-2 flex items-center gap-3">
            <button className="btn" type="submit">Kaydet</button>
            <a className="text-sky-700 underline" href={publicUrl} target="_blank" rel="noreferrer">Kartı Görüntüle</a>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Fotoğraf</h2>
        <form onSubmit={uploadPhoto} className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" />
          <button className="btn" type="submit">Yükle</button>
        </form>
        {profile.photo_url && <img src={profile.photo_url} alt="avatar" className="mt-3 h-24 w-24 rounded-full object-cover border" />}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Harita</h2>
        <form onSubmit={saveMap} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="input" placeholder="Adres" value={map.address} onChange={e=>setMap({...map, address: e.target.value})} />
          <input className="input" placeholder="Enlem" value={map.latitude} onChange={e=>setMap({...map, latitude: e.target.value})} />
          <input className="input" placeholder="Boylam" value={map.longitude} onChange={e=>setMap({...map, longitude: e.target.value})} />
          <button className="btn md:col-span-3" type="submit">Kaydet</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Tema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">Bir tema seçin</label>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button type="button" key={p.name} className="btn" onClick={()=>setTheme({ primaryColor: p.primaryColor, backgroundImage: p.backgroundImage, font: p.font })}>{p.name}</button>
              ))}
            </div>
            <label className="block text-sm text-gray-600">Birincil Renk</label>
            <input className="input" type="color" value={theme.primaryColor || '#111827'} onChange={e=>setTheme({ primaryColor: e.target.value })} />
            <label className="block text-sm text-gray-600">Arkaplan Görseli (URL)</label>
            <input className="input" placeholder="https://..." value={theme.backgroundImage || ''} onChange={e=>setTheme({ backgroundImage: e.target.value })} />
            <label className="block text-sm text-gray-600">Font Ailesi</label>
            <input className="input" placeholder="Inter, system-ui" value={theme.font || 'Inter, system-ui'} onChange={e=>setTheme({ font: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-2">Önizleme</label>
            <div className="rounded-xl border p-6" style={{
              backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              fontFamily: theme.font || 'Inter, system-ui'
            }}>
              <div className="bg-white/90 rounded-xl p-6 text-center">
                <div className="h-20 w-20 rounded-full bg-gray-200 mx-auto" />
                <h3 className="text-xl font-semibold mt-3" style={{ color: theme.primaryColor || '#111827' }}>{form.full_name || profile.full_name || profile.username}</h3>
                <p className="text-sm text-gray-600">{form.title || profile.title} {form.company || profile.company ? `@ ${form.company || profile.company}` : ''}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">QR Kod</h2>
        <div className="flex items-center gap-3">
          <a className="btn" href={`${API_URL}/api/qrcode?base_url=${encodeURIComponent(window.location.origin)}`} target="_blank" rel="noreferrer">QR Kodu Gör</a>
          <span className="text-sm text-gray-600">URL: {publicUrl}</span>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">vCard</h2>
        <div className="flex items-center gap-3">
          <a className="btn" href={`/${profile.username}.vcf`} target="_blank" rel="noreferrer">vCard İndir</a>
          <span className="text-sm text-gray-600">Kişi kartını telefon rehberine kaydet</span>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Şifre Değiştir</h2>
        <form onSubmit={changePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="input" type="password" placeholder="Eski şifre" value={pwd.old_password} onChange={e=>setPwd({...pwd, old_password: e.target.value})} />
          <input className="input" type="password" placeholder="Yeni şifre" value={pwd.new_password} onChange={e=>setPwd({...pwd, new_password: e.target.value})} />
          <button className="btn" type="submit">Güncelle</button>
          {pwdMsg && <div className="md:col-span-3 text-sm text-gray-600">{pwdMsg}</div>}
        </form>
      </section>
    </div>
  )
}
