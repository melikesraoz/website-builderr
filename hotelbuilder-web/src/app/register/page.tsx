'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    try {
      console.log('Register attempt:', { name, email, password })
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      console.log('Response status:', response.status)
      
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        console.log('Kayıt başarılı:', data)
        router.push('/login?message=Kayıt başarılı! Şimdi giriş yapabilirsiniz.')
      } else {
        setError(data.message || 'Kayıt başarısız')
      }
    } catch (error) {
      console.error('Kayıt hatası:', error)
      setError('Bağlantı hatası - Backend çalışmıyor olabilir')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-section">
          <div className="logo-image">
            <Image
              src="/webSnap-logo.png"
              alt="WebSnap Logo"
              width={120}
              height={120}
              priority
            />
          </div>
        </div>

        <h2 className="login-title">Kayıt Ol</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="login-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Ad Soyad
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="form-input"
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder="john@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Şifre Tekrar
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="register-link">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="link">
            Giriş Yap
          </Link>
        </p>
      </div>

      <footer className="footer">
        <p>
          <em>"Create your website in a snap, as unique as your fingerprint."</em>
        </p>
      </footer>
    </div>
  )
}
