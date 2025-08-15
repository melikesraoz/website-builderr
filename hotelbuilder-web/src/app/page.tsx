import Link from "next/link";

export default function Home() {
  return (
    <div className="fade-in">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1 className="title">WebSnap</h1>
          <p className="subtitle">
            CREATE YOUR WEBSITE IN A SNAP
          </p>
          <div>
            <Link href="/login" className="btn btn-primary">
              Giriş Yap
            </Link>
            <Link href="/register" className="btn btn-secondary">
              Kayıt Ol
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-3">
          <div className="card">
            <span className="card-icon">🔗</span>
            <h3 className="card-title">URL ile Klonlama</h3>
            <p className="card-text">
              Herhangi bir otel web sitesinin URL'sini girerek sayfayı otomatik olarak klonlayın.
            </p>
          </div>
          
          <div className="card">
            <span className="card-icon">⚡</span>
            <h3 className="card-title">Hızlı Oluşturma</h3>
            <p className="card-text">
              HTML, CSS, JS dosyaları otomatik olarak düzeltilir ve siteniz anında hazır olur.
            </p>
          </div>
          
          <div className="card">
            <span className="card-icon">📤</span>
            <h3 className="card-title">Kolay Export</h3>
            <p className="card-text">
              Oluşturduğunuz siteleri tek tıkla görüntüleyin ve müşterilerinizle paylaşın.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="card">
          <h2 className="card-title" style={{textAlign: 'center', fontSize: '1.75rem', marginBottom: '32px'}}>
            Nasıl Çalışır?
          </h2>
          <div className="grid grid-4">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4 className="step-title">URL Girin</h4>
              <p className="step-text">Klonlamak istediğiniz otel sitesinin URL'sini girin</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h4 className="step-title">Otomatik İşlem</h4>
              <p className="step-text">Sistem HTML'i çeker ve asset'leri düzeltir</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h4 className="step-title">Site Oluşturulur</h4>
              <p className="step-text">Siteniz production klasörüne kaydedilir</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h4 className="step-title">Paylaşın</h4>
              <p className="step-text">Site linkini müşterilerinizle paylaşın</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="cta">
          <h2 className="cta-title">Hemen Başlayın</h2>
          <p className="cta-text">
            Ücretsiz hesap oluşturun ve ilk sitenizi klonlayın
          </p>
          <Link href="/register" className="cta-btn">
            Ücretsiz Kayıt Ol
          </Link>
        </div>
      </div>
    </div>
  );
}
