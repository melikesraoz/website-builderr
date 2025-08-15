'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

export default function DashboardPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Token'dan user bilgisini al
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Giriş yapmanız gerekiyor');
      setLoading(false);
      return;
    }

    // Token'dan user bilgisini decode et (basit)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch (err) {
      console.error('Token decode hatası:', err);
    }

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
        setHotels(data.hotels);
      } else {
        setError('Otel listesi alınamadı - Backend bağlantısı yok');
      }
    } catch (err) {
      setError('Bağlantı hatası - Backend çalışmıyor');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-title">Bağlantı Hatası</div>
          <div className="error-message">{error}</div>
          <div className="error-actions">
            <Link href="/login" className="btn btn-primary">
              Giriş Yap
            </Link>
            <button onClick={() => window.location.reload()} className="btn btn-secondary">
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <div className="logo-image">
            <Image
              src="/webSnap-logo.png"
              alt="WebSnap Logo"
              width={40}
              height={40}
            />
          </div>
          <span className="brand-text">WebSnap</span>
        </div>
        
        <div className="nav-menu">
          <Link href="/dashboard" className="nav-link active">
            Dashboard
          </Link>
          <Link href="/create" className="nav-link">
            Site Oluştur
          </Link>
          <Link href="/export" className="nav-link">
            Export
          </Link>
        </div>

        <div className="nav-user">
          <span className="user-name">{user?.name || 'Kullanıcı'}</span>
          <button onClick={handleLogout} className="btn btn-logout">
            Çıkış
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-info">
            <h1 className="header-title">Dashboard</h1>
            <p className="header-subtitle">Sitelerinizi yönetin ve yeni siteler oluşturun</p>
          </div>
          <Link href="/create" className="btn btn-create">
            + Yeni Site Oluştur
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏨</div>
            <div className="stat-number">{hotels.length}</div>
            <div className="stat-label">Toplam Site</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-number">{hotels.filter(h => h.siteUrl).length}</div>
            <div className="stat-label">Aktif Site</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-number">
              {hotels.length > 0 ? new Date(hotels[0].createdAt).toLocaleDateString('tr-TR') : '-'}
            </div>
            <div className="stat-label">Son Güncelleme</div>
          </div>
        </div>

        {/* Hotels List */}
        <div className="hotels-section">
          <div className="section-header">
            <h2 className="section-title">Siteleriniz</h2>
            <div className="section-actions">
              <Link href="/create" className="btn btn-secondary">
                + Yeni Site
              </Link>
            </div>
          </div>
          
          {hotels.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏗️</div>
              <div className="empty-title">Henüz site oluşturmadınız</div>
              <div className="empty-description">
                İlk sitenizi oluşturmak için aşağıdaki butona tıklayın
              </div>
              <Link href="/create" className="btn btn-primary">
                İlk Sitenizi Oluşturun
              </Link>
            </div>
          ) : (
            <div className="hotels-grid">
              {hotels.map((hotel) => (
                <div key={hotel._id} className="hotel-card">
                  <div className="hotel-header">
                    <h3 className="hotel-name">{hotel.name}</h3>
                    <div className="hotel-status">
                      {hotel.siteUrl ? (
                        <span className="status-badge active">Aktif</span>
                      ) : (
                        <span className="status-badge inactive">Pasif</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="hotel-description">{hotel.description}</p>
                  
                  <div className="hotel-details">
                    <div className="detail-item">
                      <span className="detail-label">📍</span>
                      <span className="detail-value">{hotel.address}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">📞</span>
                      <span className="detail-value">{hotel.phone}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">✉️</span>
                      <span className="detail-value">{hotel.email}</span>
                    </div>
                  </div>

                  <div className="hotel-actions">
                    {hotel.siteUrl && (
                      <a 
                        href={`http://localhost:5000${hotel.siteUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-view"
                      >
                        👁️ Görüntüle
                      </a>
                    )}
                    <Link 
                      href={`/edit/${hotel._id}`}
                      className="btn btn-edit"
                    >
                      ✏️ Düzenle
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
