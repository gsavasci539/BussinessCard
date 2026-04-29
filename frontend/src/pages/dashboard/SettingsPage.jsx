import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api, API_URL } from '../../api/client'
import { QRCodeSVG } from 'qrcode.react'

export default function SettingsPage(){
  const { profile, setProfile } = useAuth()
  const [theme, setTheme] = useState({ primaryColor: '#111827', backgroundImage: '', font: 'Inter, system-ui' })
  const [pwd, setPwd] = useState({ old_password: '', new_password: '' })
  const [pwdMsg, setPwdMsg] = useState('')
  const [showQRModal, setShowQRModal] = useState(false)

  useEffect(() => {
    console.log('Profile değişti:', profile)
    console.log('Profile.theme:', profile?.theme)
    if(profile){
      const newTheme = {
        primaryColor: profile.theme?.primaryColor || '#111827',
        backgroundImage: profile.theme?.backgroundImage || '',
        font: profile.theme?.font || 'Inter, system-ui'
      }
      console.log('Yeni tema ayarları:', newTheme)
      setTheme(newTheme)
    }
  }, [profile])

  if(!profile){
    return <div>Yükleniyor...</div>
  }


  const saveTheme = async (e) => {
    e.preventDefault()
    try {
      console.log('Mevcut theme state:', theme)
      console.log('Theme tipi:', typeof theme)
      console.log('Theme JSON:', JSON.stringify(theme, null, 2))
      
      // Backend formatına uygun theme objesi oluştur - mevcut veriyi koru
      const themePayload = {
        primaryColor: theme.primaryColor || '#111827',
        backgroundColor: theme.backgroundImage ? '#ffffff' : theme.primaryColor, // Arka plan görseli varsa beyaz, yoksa primaryColor
        textColor: theme.backgroundImage ? '#1f2937' : '#ffffff', // Arka plan görseli varsa koyu, yoksa açık
        font: theme.font || 'Inter, system-ui',
        backgroundImage: theme.backgroundImage || ''
      }
      
      const payload = { theme: themePayload }
      console.log('Gönderilen payload:', payload)
      console.log('Payload JSON:', JSON.stringify(payload, null, 2))
      
      const res = await api.put('/api/profile', payload)
      console.log('Tema güncelleme yanıtı:', res.data)
      console.log('Yanıt theme:', res.data.theme)
      
      setProfile(res.data)
      alert('Tema ayarları başarıyla güncellendi!')
    } catch (error) {
      console.error('Tema güncelleme hatası:', error)
      console.error('Hata response:', error.response)
      console.error('Hata response data:', error.response?.data)
      alert('Tema ayarları güncellenirken bir hata oluştu: ' + (error.response?.data?.detail || error.message))
    }
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

  const publicUrl = `${window.location.origin}/${profile.username}`
  const presets = [
    { name: 'Klasik', primaryColor: '#111827', backgroundImage: '', font: 'Inter, system-ui' },
    { name: 'Okyanus', primaryColor: '#0ea5e9', backgroundImage: '', font: 'Poppins, system-ui' },
    { name: 'Günbatımı', primaryColor: '#f97316', backgroundImage: '', font: 'Nunito, system-ui' },
  ]

  return (
    <div className="space-y-10">

      <section>
        <h2 className="text-lg font-semibold mb-3">Tema Ayarları</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hazır Temalar</label>
              <div className="flex flex-wrap gap-2">
                {presets.map(p => (
                  <button key={p.name} type="button" className="btn" onClick={()=>setTheme({ primaryColor: p.primaryColor, backgroundImage: p.backgroundImage, font: p.font })}>{p.name}</button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birincil Renk</label>
              <div className="flex items-center gap-2">
                <input className="input w-16 h-10 p-1" type="color" value={theme.primaryColor} onChange={e=>setTheme({ ...theme, primaryColor: e.target.value })} />
                <input className="input flex-1" type="text" value={theme.primaryColor} onChange={e=>setTheme({ ...theme, primaryColor: e.target.value })} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Arkaplan Görseli</label>
              <input className="input" placeholder="https://example.com/image.jpg" value={theme.backgroundImage} onChange={e=>setTheme({ ...theme, backgroundImage: e.target.value })} />
              <p className="text-xs text-gray-500 mt-1">Kartınızın arka planında gösterilecek görselin URL'si</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Ailesi</label>
              <select className="input" value={theme.font} onChange={e=>setTheme({ ...theme, font: e.target.value })}>
                <option value="Inter, system-ui">Inter</option>
                <option value="Poppins, system-ui">Poppins</option>
                <option value="Nunito, system-ui">Nunito</option>
                <option value="Roboto, system-ui">Roboto</option>
                <option value="Open Sans, system-ui">Open Sans</option>
                <option value="Montserrat, system-ui">Montserrat</option>
              </select>
            </div>
            
            <button className="btn w-full" onClick={saveTheme}>Tema Ayarlarını Kaydet</button>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-2">Önizleme</label>
            <div className="rounded-xl border p-6" style={{
              backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : undefined,
              backgroundColor: theme.backgroundImage ? undefined : theme.primaryColor,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              fontFamily: theme.font
            }}>
              <div className="bg-white/90 rounded-xl p-6 text-center">
                <div className="h-20 w-20 rounded-full bg-gray-200 mx-auto" />
                <h3 className="text-xl font-semibold mt-3" style={{ color: theme.backgroundImage ? theme.primaryColor : '#ffffff' }}>{profile.full_name || profile.username}</h3>
                <p className="text-sm text-gray-600">{profile.title} {profile.company ? `@ ${profile.company}` : ''}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">QR Kod & vCard</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQRModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            QR Kodu Gör
          </button>
          <a className="btn" href={`/${profile.username}.vcf`} target="_blank" rel="noreferrer">vCard İndir</a>
          <span className="text-sm text-gray-600">URL: {publicUrl}</span>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Şifre Değiştir</h2>
        <form onSubmit={changePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="input" type="password" placeholder="Eski şifre" value={pwd.old_password} onChange={e=>setPwd({...pwd, old_password: e.target.value})} />
          <input className="input" type="password" placeholder="Yeni şifre" value={pwd.new_password} onChange={e=>setPwd({...pwd, new_password: e.target.value})} />
          <button className="btn" type="submit">Güncelle</button>
          {pwdMsg && <div className="md:col-span-3 text-sm text-gray-600">{pwdMsg}</div>}
        </form>
      </section>
      
      {/* QR Kodu Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">QR Kod</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <QRCodeSVG
                  value={`${window.location.origin}/${profile.username}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Bu QR kodu tarayarak kartvizitimi kolayca paylaşabilirsiniz.
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${profile.username}`);
                  alert('Link panoya kopyalandı!');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Linki Kopyala
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}