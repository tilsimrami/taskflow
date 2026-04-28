'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      if (error) setError(error.message)
      else router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-800">
        <h1 className="text-3xl font-bold text-white mb-2">TaskFlow</h1>
        <p className="text-gray-400 mb-8">{isSignUp ? 'Hesap oluştur' : 'Giriş yap'}</p>

        {isSignUp && (
          <input
            type="text"
            placeholder="Ad Soyad"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 mb-3 border border-gray-700 focus:outline-none focus:border-blue-500"
          />
        )}

        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 mb-3 border border-gray-700 focus:outline-none focus:border-blue-500"
        />

        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 mb-4 border border-gray-700 focus:outline-none focus:border-blue-500"
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-3 mb-4 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Yükleniyor...' : isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
        </button>

        <p className="text-gray-400 text-center text-sm">
          {isSignUp ? 'Hesabın var mı?' : 'Hesabın yok mu?'}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:underline"
          >
            {isSignUp ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </p>
      </div>
    </div>
  )
}
