import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register(){
  const { register, loading } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: ''})
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    try{
      await register(form)
      navigate('/dashboard')
    }catch(err){
      setError('Kayıt başarısız')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Kayıt Ol</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input" placeholder="Kullanıcı adı" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} autoComplete="off" spellCheck="false" />
        <input className="input" placeholder="E-posta" type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} autoComplete="off" spellCheck="false" />
        <input className="input" placeholder="Şifre" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} autoComplete="off" spellCheck="false" />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn w-full" disabled={loading}>Kayıt Ol</button>
      </form>
    </div>
  )
}
