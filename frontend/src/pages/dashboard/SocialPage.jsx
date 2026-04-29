import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/client'

export default function SocialPage(){
  const { profile, setProfile } = useAuth()
  const [links, setLinks] = useState({ linkedin: '', instagram: '', github: '', twitter: '', facebook: '', youtube: '', tiktok: '' })

  useEffect(() => {
    if(profile){
      setLinks({
        linkedin: profile.social_links?.linkedin || '',
        instagram: profile.social_links?.instagram || '',
        github: profile.social_links?.github || '',
        twitter: profile.social_links?.twitter || '',
        facebook: profile.social_links?.facebook || '',
        youtube: profile.social_links?.youtube || '',
        tiktok: profile.social_links?.tiktok || ''
      })
    }
  }, [profile])

  const save = async (e) => {
    e.preventDefault()
    const res = await api.put('/api/profile', { social_links: links })
    setProfile(res.data)
  }

  if(!profile){
    return <div>Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Sosyal Medya</h2>
      <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="input" placeholder="LinkedIn URL" value={links.linkedin} onChange={e=>setLinks({...links, linkedin: e.target.value})} autoComplete="off" spellCheck="false" />
        <input className="input" placeholder="Instagram URL" value={links.instagram} onChange={e=>setLinks({...links, instagram: e.target.value})} autoComplete="off" spellCheck="false" />
        <input className="input" placeholder="GitHub URL" value={links.github} onChange={e=>setLinks({...links, github: e.target.value})} autoComplete="off" spellCheck="false" />
        <input className="input" placeholder="Twitter URL" value={links.twitter} onChange={e=>setLinks({...links, twitter: e.target.value})} autoComplete="off" spellCheck="false" />
        <input className="input" placeholder="Facebook URL" value={links.facebook} onChange={e=>setLinks({...links, facebook: e.target.value})} autoComplete="off" spellCheck="false" />
        <input className="input" placeholder="YouTube URL" value={links.youtube} onChange={e=>setLinks({...links, youtube: e.target.value})} autoComplete="off" spellCheck="false" />
        <input className="input" placeholder="TikTok URL" value={links.tiktok} onChange={e=>setLinks({...links, tiktok: e.target.value})} autoComplete="off" spellCheck="false" />
        <div className="md:col-span-2"><button className="btn">Kaydet</button></div>
      </form>
    </div>
  )
}
