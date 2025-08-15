'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'url'>('manual');
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    rooms: ''
  });
  const [urlData, setUrlData] = useState({
    url: '',
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    rooms: '',
    logo: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    whatsapp: '',
    checkIn: '',
    checkOut: '',
    amenities: '',
    priceRange: '',
    starRating: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Giriş yapmanız gerekiyor');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/hotel/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Otel başarıyla oluşturuldu!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Otel oluşturulamadı - Backend bağlantısı yok');
      }
    } catch (error) {
      setError('Bağlantı hatası - Backend çalışmıyor');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlData.url || !urlData.name) {
      setError('URL ve otel adı gereklidir');
      return;
    }

    if (!urlData.address || !urlData.phone || !urlData.email) {
      setError('Adres, telefon ve email bilgileri gereklidir');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Giriş yapmanız gerekiyor');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/hotel/generate/from-url', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(urlData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Site başarıyla klonlandı!');
        setUrlData({ 
          url: '', 
          name: '', 
          description: '', 
          address: '', 
          phone: '', 
          email: '', 
          rooms: '', 
          logo: '',
          website: '',
          facebook: '',
          instagram: '',
          twitter: '',
          linkedin: '',
          youtube: '',
          whatsapp: '',
          checkIn: '',
          checkOut: '',
          amenities: '',
          priceRange: '',
          starRating: ''
        });
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Site klonlanamadı - Backend bağlantısı yok');
      }
    } catch (error) {
      setError('Bağlantı hatası - Backend çalışmıyor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUrlData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="create-page">
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
          <Link href="/create" className="nav-link active">
            Site Oluştur
          </Link>
          <Link href="/export" className="nav-link">
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
      <div className="create-content">
        <div className="create-container">
          <div className="create-header">
            <h1 className="create-title">Yeni Site Oluştur</h1>
            <p className="create-subtitle">
              Manuel olarak bilgi girin veya URL ile site klonlayın
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
              onClick={() => setActiveTab('manual')}
            >
              📝 Manuel Oluştur
            </button>
            <button
              className={`tab-button ${activeTab === 'url' ? 'active' : ''}`}
              onClick={() => setActiveTab('url')}
            >
              🔗 URL ile Klonla
            </button>
          </div>

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <div className="error-text">{error}</div>
            </div>
          )}

          {success && (
            <div className="success-message">
              <div className="success-icon">✅</div>
              <div className="success-text">{success}</div>
            </div>
          )}

          {/* Manual Form */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="create-form">
              <div className="form-section">
                <h3 className="section-title">Temel Bilgiler</h3>
                
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Otel Adı *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Örn: Grand Hotel"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Açıklama
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Otel hakkında kısa açıklama..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">İletişim Bilgileri</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address" className="form-label">
                      Adres
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Otel adresi"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Telefon
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="+90 555 123 4567"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="info@otel.com"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Ek Bilgiler</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="rooms" className="form-label">
                      Oda Sayısı
                    </label>
                    <input
                      id="rooms"
                      name="rooms"
                      type="number"
                      value={formData.rooms}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="50"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="logo" className="form-label">
                      Logo URL
                    </label>
                    <input
                      id="logo"
                      name="logo"
                      type="url"
                      value={formData.logo}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <Link href="/dashboard" className="btn btn-secondary">
                  İptal
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Oluşturuluyor...' : 'Site Oluştur'}
                </button>
              </div>
            </form>
          )}

          {/* URL Clone Form */}
          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="create-form">
              <div className="form-section">
                <h3 className="section-title">URL ile Site Klonlama</h3>
                <p className="section-description">
                  Bir otel web sitesinin URL'sini girerek sayfayı otomatik olarak klonlayabilirsiniz.
                </p>
                
                <div className="form-group">
                  <label htmlFor="url" className="form-label">
                    Site URL'si *
                  </label>
                  <input
                    id="url"
                    name="url"
                    type="url"
                    value={urlData.url}
                    onChange={handleUrlInputChange}
                    required
                    className="form-input"
                    placeholder="https://example-hotel.com"
                  />
                                     <small className="form-help">
                     Klonlamak istediğiniz otel web sitesinin tam URL'sini girin
                   </small>
                   <div className="form-example">
                     <strong>Örnek URL'ler:</strong>
                     <ul>
                       <li>https://www.hilton.com/en/hotels/istanbul-hiitw-hilton-istanbul-bomonti-hotel-cekmekoy/</li>
                       <li>https://www.marriott.com/en-us/hotels/istmc-istanbul-marriott-hotel-sisli/</li>
                       <li>https://www.booking.com/hotel/tr/grand-hotel-istanbul.html</li>
                     </ul>
                   </div>
                </div>

                               <div className="form-group">
                 <label htmlFor="urlName" className="form-label">
                   Otel Adı *
                 </label>
                 <input
                   id="urlName"
                   name="name"
                   type="text"
                   value={urlData.name}
                   onChange={handleUrlInputChange}
                   required
                   className="form-input"
                   placeholder="Örn: Ozotel, Hilton, Marriott"
                 />
                 <small className="form-help">
                   Bu isim site klasörü ve veritabanı kaydı için kullanılacak
                 </small>
               </div>

               <div className="form-group">
                 <label htmlFor="urlDescription" className="form-label">
                   Açıklama
                 </label>
                 <textarea
                   id="urlDescription"
                   name="description"
                   value={urlData.description}
                   onChange={handleUrlInputChange}
                   className="form-textarea"
                   placeholder="Otel hakkında kısa açıklama..."
                   rows={3}
                 />
               </div>
             </div>

             <div className="form-section">
               <h3 className="section-title">Otel Bilgileri (Klonlanacak)</h3>
               <p className="section-description">
                 Bu bilgiler klonlanan sitedeki mevcut bilgilerle değiştirilecek
               </p>
               
               <div className="form-row">
                 <div className="form-group">
                   <label htmlFor="urlAddress" className="form-label">
                     Adres *
                   </label>
                   <input
                     id="urlAddress"
                     name="address"
                     type="text"
                     value={urlData.address}
                     onChange={handleUrlInputChange}
                     required
                     className="form-input"
                     placeholder="Otel adresi"
                   />
                 </div>

                 <div className="form-group">
                   <label htmlFor="urlPhone" className="form-label">
                     Telefon *
                   </label>
                   <input
                     id="urlPhone"
                     name="phone"
                     type="tel"
                     value={urlData.phone}
                     onChange={handleUrlInputChange}
                     required
                     className="form-input"
                     placeholder="+90 555 123 4567"
                   />
                 </div>
               </div>

               <div className="form-row">
                 <div className="form-group">
                   <label htmlFor="urlEmail" className="form-label">
                     Email *
                   </label>
                   <input
                     id="urlEmail"
                     name="email"
                     type="email"
                     value={urlData.email}
                     onChange={handleUrlInputChange}
                     required
                     className="form-input"
                     placeholder="info@otel.com"
                   />
                 </div>

                 <div className="form-group">
                   <label htmlFor="urlRooms" className="form-label">
                     Oda Sayısı
                   </label>
                   <input
                     id="urlRooms"
                     name="rooms"
                     type="number"
                     value={urlData.rooms}
                     onChange={handleUrlInputChange}
                     className="form-input"
                     placeholder="50"
                   />
                 </div>
               </div>

               <div className="form-group">
                 <label htmlFor="urlLogo" className="form-label">
                   Logo URL
                 </label>
                 <input
                   id="urlLogo"
                   name="logo"
                   type="url"
                   value={urlData.logo}
                   onChange={handleUrlInputChange}
                   className="form-input"
                   placeholder="https://example.com/logo.png"
                 />
                                   <small className="form-help">
                    Bu logo klonlanan sitedeki mevcut logo ile değiştirilecek
                  </small>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Sosyal Medya Hesapları</h3>
                <p className="section-description">
                  Sosyal medya hesaplarınızı girin, klonlanan sitedeki mevcut hesaplarla değiştirilecek
                </p>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="urlWebsite" className="form-label">
                      Website
                    </label>
                    <input
                      id="urlWebsite"
                      name="website"
                      type="url"
                      value={urlData.website}
                      onChange={handleUrlInputChange}
                      className="form-input"
                      placeholder="https://myhotel.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="urlFacebook" className="form-label">
                      Facebook
                    </label>
                    <input
                      id="urlFacebook"
                      name="facebook"
                      type="url"
                      value={urlData.facebook}
                      onChange={handleUrlInputChange}
                      className="form-input"
                      placeholder="https://facebook.com/myhotel"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="urlInstagram" className="form-label">
                      Instagram
                    </label>
                    <input
                      id="urlInstagram"
                      name="instagram"
                      type="url"
                      value={urlData.instagram}
                      onChange={handleUrlInputChange}
                      className="form-input"
                      placeholder="https://instagram.com/myhotel"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="urlTwitter" className="form-label">
                      Twitter/X
                    </label>
                    <input
                      id="urlTwitter"
                      name="twitter"
                      type="url"
                      value={urlData.twitter}
                      onChange={handleUrlInputChange}
                      className="form-input"
                      placeholder="https://twitter.com/myhotel"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="urlLinkedin" className="form-label">
                      LinkedIn
                    </label>
                    <input
                      id="urlLinkedin"
                      name="linkedin"
                      type="url"
                      value={urlData.linkedin}
                      onChange={handleUrlInputChange}
                      className="form-input"
                      placeholder="https://linkedin.com/company/myhotel"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="urlYoutube" className="form-label">
                      YouTube
                    </label>
                    <input
                      id="urlYoutube"
                      name="youtube"
                      type="url"
                      value={urlData.youtube}
                      onChange={handleUrlInputChange}
                      className="form-input"
                      placeholder="https://youtube.com/@myhotel"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="urlWhatsapp" className="form-label">
                    WhatsApp
                  </label>
                  <input
                    id="urlWhatsapp"
                    name="whatsapp"
                    type="tel"
                    value={urlData.whatsapp}
                    onChange={handleUrlInputChange}
                    className="form-input"
                    placeholder="+90 555 123 4567"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Otel Detayları</h3>
                <p className="section-description">
                  Ek otel bilgileri ve özellikleri
                </p>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="urlCheckIn" className="form-label">
                      Check-in Saati
                    </label>
                    <input
                      id="urlCheckIn"
                      name="checkIn"
                      type="text"
                      value={urlData.checkIn}
                      onChange={handleUrlInputChange}
                      className="form-input"
                      placeholder="14:00"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="urlCheckOut" className="form-label">
                      Check-out Saati
                    </label>
                    <input
                      id="urlCheckOut"
                      name="checkOut"
                      type="text"
                      value={urlData.checkOut}
                      onChange={handleUrlInputChange}
                      className="form-input"
                      placeholder="11:00"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="urlStarRating" className="form-label">
                      Yıldız Sayısı
                    </label>
                    <select
                      id="urlStarRating"
                      name="starRating"
                      value={urlData.starRating}
                      onChange={handleUrlInputChange}
                      className="form-input"
                    >
                      <option value="">Seçiniz</option>
                      <option value="1">⭐ 1 Yıldız</option>
                      <option value="2">⭐⭐ 2 Yıldız</option>
                      <option value="3">⭐⭐⭐ 3 Yıldız</option>
                      <option value="4">⭐⭐⭐⭐ 4 Yıldız</option>
                      <option value="5">⭐⭐⭐⭐⭐ 5 Yıldız</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="urlPriceRange" className="form-label">
                      Fiyat Aralığı
                    </label>
                    <input
                      id="urlPriceRange"
                      name="priceRange"
                      type="text"
                      value={urlData.priceRange}
                      onChange={handleUrlInputChange}
                      className="form-input"
                      placeholder="₺500-₺2000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="urlAmenities" className="form-label">
                    Özellikler (Virgülle ayırın)
                  </label>
                  <textarea
                    id="urlAmenities"
                    name="amenities"
                    value={urlData.amenities}
                    onChange={handleUrlInputChange}
                    className="form-textarea"
                    placeholder="WiFi, Havuz, Spa, Restoran, Bar, Fitness, Otopark"
                    rows={3}
                  />
                  <small className="form-help">
                    Otelinizin sunduğu özellikleri virgülle ayırarak yazın
                  </small>
                </div>
              </div>

                             <div className="form-section">
                 <h3 className="section-title">Klonlama Özellikleri</h3>
                 <div className="features-list">
                   <div className="feature-item">
                     <span className="feature-icon">✅</span>
                     <span className="feature-text">HTML içeriği otomatik çekilir</span>
                   </div>
                   <div className="feature-item">
                     <span className="feature-icon">✅</span>
                     <span className="feature-text">Resim, CSS, JS dosyaları düzeltilir</span>
                   </div>
                   <div className="feature-item">
                     <span className="feature-icon">✅</span>
                     <span className="feature-text">Mevcut telefon numaraları değiştirilir</span>
                   </div>
                   <div className="feature-item">
                     <span className="feature-icon">✅</span>
                     <span className="feature-text">Mevcut email adresleri değiştirilir</span>
                   </div>
                   <div className="feature-item">
                     <span className="feature-icon">✅</span>
                     <span className="feature-text">Adres bilgileri güncellenir</span>
                   </div>
                   <div className="feature-item">
                     <span className="feature-icon">✅</span>
                     <span className="feature-text">Logo otomatik değiştirilir</span>
                   </div>
                                       <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span className="feature-text">Sosyal medya hesapları değiştirilir</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span className="feature-text">Check-in/out saatleri güncellenir</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span className="feature-text">Yıldız sayısı ve fiyat aralığı değiştirilir</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span className="feature-text">Otel özellikleri (amenities) güncellenir</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span className="feature-text">Website keys (name, address) tanımlanır</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span className="feature-text">Site production klasörüne kaydedilir</span>
                    </div>
                 </div>
               </div>

              <div className="form-actions">
                <Link href="/dashboard" className="btn btn-secondary">
                  İptal
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Klonlanıyor...' : 'Siteyi Klonla'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
