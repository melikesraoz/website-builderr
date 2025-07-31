'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'



export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  

  

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
  
    if (password !== confirmPassword) {
      alert('Şifreler uyuşmuyor!')
      return
    }
  
    if (!acceptTerms) {
      alert('Lütfen kullanım koşullarını kabul edin.')
      return
    }
  
    try {
      const response = await fetch('http://localhost:5251/api/Auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
  
      if (!response.ok) {
        throw new Error('Kayıt başarısız.')
      }
  
      const data = await response.json()
      console.log('Kayıt başarılı:', data)
  
      alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.')
      window.location.href = '/login' // veya router.push('/login') — useRouter ekleyerek
  
    } catch (error: any) {
      console.error('Kayıt hatası:', error)
      alert('Kayıt sırasında bir hata oluştu.')
    }
  }

  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-lg">
        <div className="flex justify-center mb-6">
          <Image
            src="/webSnap-logo.png"
            alt="WebSnap Logo"
            width={200}
            height={200}
          />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">Kayıt Ol</h2>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-1">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm mb-1">
              Şifre Tekrar
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={() => setAcceptTerms(!acceptTerms)}
              className="accent-blue-500 mr-2"
            />
            <span>
              <Link href="#" className="text-blue-400 hover:underline">
                Kullanım koşullarını
              </Link>{' '}
              kabul ediyorum.
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded-lg font-semibold"
          >
            Kayıt Ol
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>

      <footer className="mt-8 text-center text-xs text-gray-500 max-w-xs">
        <p>
          <em>"Create your website in a snap, as unique as your fingerprint."</em>
        </p>
      </footer>
    </div>
  )
}
