'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Hotel {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  siteUrl: string;
  createdAt: string;
}

export default function ExportPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Giriş yapmanız gerekiyor');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/hotel/my-hotels', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHotels(data.hotels.filter((hotel: Hotel) => hotel.siteUrl));
      } else {
        setError('Otel listesi alınamadı');
      }
    } catch (err) {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link kopyalandı!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <Link href="/login" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Site Export</h1>
          <Link 
            href="/dashboard" 
            className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            ← Dashboard'a Dön
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">📤 Site Export Merkezi</h2>
            <p className="text-gray-300 mb-4">
              Oluşturduğunuz siteleri görüntüleyebilir, linklerini kopyalayabilir ve 
              müşterilerinizle paylaşabilirsiniz.
            </p>
            <div className="text-sm text-gray-400">
              <div className="mb-2">✅ Tüm siteleriniz burada listelenir</div>
              <div className="mb-2">✅ Link kopyalama özelliği</div>
              <div>✅ Yeni sekmede açma</div>
            </div>
          </div>

          {hotels.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-4">Henüz aktif siteniz bulunmuyor</div>
              <Link 
                href="/create" 
                className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 transition-colors"
              >
                İlk Sitenizi Oluşturun
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotels.map((hotel) => (
                <div key={hotel._id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">{hotel.name}</h3>
                    <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
                      Aktif
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">{hotel.description}</p>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div><span className="text-gray-500">Adres:</span> {hotel.address}</div>
                    <div><span className="text-gray-500">Telefon:</span> {hotel.phone}</div>
                    <div><span className="text-gray-500">Email:</span> {hotel.email}</div>
                    <div><span className="text-gray-500">Oluşturulma:</span> {new Date(hotel.createdAt).toLocaleDateString('tr-TR')}</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <a 
                        href={`http://localhost:5000${hotel.siteUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-600 px-4 py-2 rounded text-center hover:bg-green-700 transition-colors text-sm"
                      >
                        🌐 Yeni Sekmede Aç
                      </a>
                      <button
                        onClick={() => copyToClipboard(`http://localhost:5000${hotel.siteUrl}`)}
                        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        📋 Kopyala
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500 bg-gray-700 p-2 rounded">
                      <div className="font-medium mb-1">Site Linki:</div>
                      <div className="break-all">
                        http://localhost:5000{hotel.siteUrl}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">📋 Export İpuçları</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div>• Site linklerini müşterilerinizle paylaşabilirsiniz</div>
              <div>• Linkler doğrudan çalışır ve herhangi bir tarayıcıda açılabilir</div>
              <div>• Siteleriniz otomatik olarak güncellenir</div>
              <div>• Yeni siteler oluşturduğunuzda burada görünecektir</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
