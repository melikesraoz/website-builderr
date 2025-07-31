'use client'
import { useRouter } from 'next/navigation'
import { loginUser } from '@/lib/api'


import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()



const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const data = await loginUser(email, password);

    // Token'ı localStorage'a kaydet
    localStorage.setItem('token', data.token);

    router.push('/dashboard');
  } catch (err) {
    console.error('Giriş başarısız:', err);
    alert('Giriş başarısız, lütfen bilgilerinizi kontrol edin.');
  }
};


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-lg">
        <div className="flex justify-center mb-6">
          <Image
            src="/webSnap-logo.png"
            alt="WebSnap Logo"
            width={270}
            height={270}
          />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">Giriş Yap</h2>

        <form onSubmit={handleLogin} className="space-y-5">
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

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="accent-blue-500"
              />
              Beni Hatırla
            </label>
            <Link href="#" className="text-blue-400 hover:underline">
              Şifremi unuttum?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded-lg font-semibold"
          >
            Giriş Yap
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="text-blue-400 hover:underline">
            Kayıt Ol
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
