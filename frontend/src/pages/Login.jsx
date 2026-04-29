import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const { login, loading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    try{
      await login(username, password)
      navigate('/dashboard')
    }catch(err){
      setError('Giriş başarısız')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Giriş</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input" placeholder="Kullanıcı adı" value={username} onChange={e=>setUsername(e.target.value)} autoComplete="off" spellCheck="false" />
        <input className="input" placeholder="Şifre" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="off" spellCheck="false" />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn w-full" disabled={loading}>Giriş Yap</button>
      </form>
    </div>
  )
}
