'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Login attempt:', { email, password })
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('Response status:', response.status)
      
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', data.token)
        console.log('Giriş başarılı:', data)
        router.push('/dashboard')
      } else {
        setError(data.message || 'Giriş başarısız')
      }
    } catch (error) {
      console.error('Giriş hatası:', error)
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

        <h2 className="login-title">Giriş Yap</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
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
              placeholder="testuser@example.com"
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

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="checkbox"
              />
              Beni Hatırla
            </label>
            <Link href="#" className="forgot-link">
              Şifremi unuttum?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="register-link">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="link">
            Kayıt Ol
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
