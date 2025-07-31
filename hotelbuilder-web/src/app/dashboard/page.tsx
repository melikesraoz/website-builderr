'use client'

import { useEffect, useState } from 'react'
import { getMyHotels } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [hotels, setHotels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchHotels() {
      try {
        const data = await getMyHotels()
        setHotels(data.hotels)
      } catch (err) {
        console.error('Otel verileri alınamadı:', err)
        alert('Giriş yapmalısınız.')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchHotels()
  }, [])

  if (loading) {
    return <p className="text-white text-center mt-10">Yükleniyor...</p>
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <h2 className="text-xl mb-4">Oluşturduğunuz Oteller</h2>

      {hotels.length === 0 ? (
        <p>Henüz otel eklemediniz.</p>
      ) : (
        <ul className="space-y-4">
          {hotels.map((hotel) => (
            <li
              key={hotel._id}
              className="bg-gray-800 p-4 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold">{hotel.name}</h3>
              <p>{hotel.description}</p>
              <p className="text-sm text-gray-400">{hotel.email}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
