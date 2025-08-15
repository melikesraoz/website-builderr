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
  siteUrl?: string;
  createdAt: string;
}

export default function ExportPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Giriş yapmanız gerekiyor');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/hotel/my-hotels', {
        headers: {
          'Authorization': `Bearer ${token}`
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

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  const getSiteStatus = (hotel: Hotel) => {
    if (hotel.siteUrl) {
      return { status: 'active', text: 'Aktif', color: 'success' };
    }
    return { status: 'inactive', text: 'Site Yok', color: 'warning' };
  };

  if (loading) {
    return (
      <div className="export-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Siteleriniz yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="export-page">
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
    <div className="export-page">
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
          <Link href="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link href="/create" className="nav-link">
            Site Oluştur
          </Link>
          <Link href="/export" className="nav-link active">
            Export
          </Link>
        </div>

        <div className="nav-user">
          <Link href="/dashboard" className="btn btn-secondary">
            Geri Dön
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="export-content">
        <div className="export-container">
          <div className="export-header">
            <h1 className="export-title">Site Export & Yönetim</h1>
            <p className="export-subtitle">
              Oluşturduğunuz siteleri görüntüleyin, paylaşın ve yönetin
            </p>
          </div>

          {/* Stats Overview */}
          <div className="export-stats">
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
              <div className="stat-icon">🔗</div>
              <div className="stat-number">{hotels.filter(h => h.siteUrl).length}</div>
              <div className="stat-label">Paylaşılabilir</div>
            </div>
          </div>

          {hotels.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📤</div>
              <div className="empty-title">Henüz site oluşturmadınız</div>
              <div className="empty-description">
                Export edilecek site bulunamadı. Önce bir site oluşturun veya URL ile klonlayın.
              </div>
              <div className="empty-actions">
                <Link href="/create" className="btn btn-primary">
                  Site Oluştur
                </Link>
                <Link href="/create" className="btn btn-secondary">
                  URL ile Klonla
                </Link>
              </div>
            </div>
          ) : (
            <div className="export-grid">
              {hotels.map((hotel) => {
                const status = getSiteStatus(hotel);
                const siteUrl = hotel.siteUrl ? `http://localhost:5000${hotel.siteUrl}` : null;
                
                return (
                  <div key={hotel._id} className="export-card">
                    <div className="export-card-header">
                      <div className="export-card-title-section">
                        <h3 className="export-card-title">{hotel.name}</h3>
                        <div className={`status-badge ${status.color}`}>
                          {status.text}
                        </div>
                      </div>
                      <div className="export-card-date">
                        {new Date(hotel.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                    
                    <p className="export-card-description">
                      {hotel.description || 'Açıklama bulunmuyor'}
                    </p>
                    
                    <div className="export-card-details">
                      <div className="detail-item">
                        <span className="detail-label">📍</span>
                        <span className="detail-value">{hotel.address || 'Adres belirtilmemiş'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">📞</span>
                        <span className="detail-value">{hotel.phone || 'Telefon belirtilmemiş'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">✉️</span>
                        <span className="detail-value">{hotel.email || 'Email belirtilmemiş'}</span>
                      </div>
                    </div>

                    <div className="export-card-actions">
                      {siteUrl ? (
                        <>
                          <a 
                            href={siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-view"
                          >
                            👁️ Görüntüle
                          </a>
                          <button 
                            onClick={() => copyToClipboard(siteUrl)}
                            className={`btn ${copiedUrl === siteUrl ? 'btn-success' : 'btn-copy'}`}
                          >
                            {copiedUrl === siteUrl ? '✅ Kopyalandı!' : '📋 Kopyala'}
                          </button>
                          <Link 
                            href={`/edit/${hotel._id}`}
                            className="btn btn-edit"
                          >
                            ✏️ Düzenle
                          </Link>
                        </>
                      ) : (
                        <div className="no-site-actions">
                          <span className="no-site-text">Site henüz oluşturulmadı</span>
                          <Link href="/create" className="btn btn-primary">
                            Site Oluştur
                          </Link>
                        </div>
                      )}
                    </div>

                    {siteUrl && (
                      <div className="export-card-url">
                        <span className="url-label">Site URL:</span>
                        <span className="url-value">{siteUrl}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3 className="quick-actions-title">Hızlı İşlemler</h3>
            <div className="quick-actions-grid">
              <Link href="/create" className="quick-action-card">
                <div className="quick-action-icon">➕</div>
                <div className="quick-action-title">Yeni Site Oluştur</div>
                <div className="quick-action-description">Manuel olarak site oluşturun</div>
              </Link>
              <Link href="/create" className="quick-action-card">
                <div className="quick-action-icon">🔗</div>
                <div className="quick-action-title">URL ile Klonla</div>
                <div className="quick-action-description">Mevcut siteyi klonlayın</div>
              </Link>
              <div className="quick-action-card">
                <div className="quick-action-icon">📊</div>
                <div className="quick-action-title">İstatistikler</div>
                <div className="quick-action-description">Site performansını görün</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
