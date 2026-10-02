import { ArrowRight, Trophy, Radio, Upload, UsersRound, UserRound } from "lucide-react";
import Link from "next/link";
import { SiteNavigation } from "@/components/SiteNavigation";

const destinations = [
  { number: "01", icon: Radio, title: "Müzik Odası", description: "Canlı yayına katıl, sıradaki parçayı dinle ve sohbete dahil ol.", href: "/muzik", action: "Dinlemeye başla", style: "featured" },
  { number: "02", icon: Trophy, title: "Topluluk listeleri", description: "Bu ayın favorilerini ve arşivde iz bırakan parçaları keşfet.", href: "/top/10", action: "Top 10'u aç", style: "" },
  { number: "03", icon: Upload, title: "Parçanı sahnele", description: "Üretimini paylaş, topluluğun ortak akışında yerini al.", href: "/yukle", action: "Şarkı yükle", style: "" },
  { number: "04", icon: UsersRound, title: "Topluluk", description: "En aktif dinleyicileri ve üreticileri tanı.", href: "/liderler", action: "Liderlik tablosu", style: "" },
  { number: "05", icon: UserRound, title: "Hesabın", description: "Giriş yap, profilini düzenle ve dinleme geçmişine ulaş.", href: "/login", action: "Giriş / Üyelik", style: "" },
];

function VinylArtwork() {
  return (
    <div className="home-art" aria-hidden="true">
      <div className="home-art-index">
        <span className="home-art-index-dot" />
        <span>THENDISCH RADIO</span>
        <span className="home-art-index-live">MÜZİK · TOPLULUK</span>
      </div>
      <div className="vinyl-disc">
        <svg className="vinyl-grooves" viewBox="0 0 440 440" fill="none">
          <circle cx="220" cy="220" r="206" />
          <circle cx="220" cy="220" r="193" />
          <circle cx="220" cy="220" r="178" />
          <circle cx="220" cy="220" r="163" />
          <circle cx="220" cy="220" r="146" />
          <circle cx="220" cy="220" r="128" />
          <circle cx="220" cy="220" r="108" />
          <circle cx="220" cy="220" r="87" />
          <path d="M220 14a206 206 0 0 1 145.66 60.34" />
        </svg>
        <div className="vinyl-label">
          <span className="vinyl-label-mark">T</span>
          <span className="vinyl-label-name">THENDISCH</span>
          <span className="vinyl-label-sub">BAĞIMSIZ MÜZİK</span>
          <span className="vinyl-label-hole" />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="studio-home">
      <SiteNavigation active="home" />

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-copy">
          <p className="home-eyebrow"><span /> THENDISCH STUDIO · BAĞIMSIZ MÜZİK TOPLULUĞU</p>
          <h1 id="home-title" className="home-title">
            Müziğin
            <span>buluştuğu yer.</span>
          </h1>
          <p className="home-description">
            Canlı dinle, yeni parçalar keşfet ve kendi üretimini müzik topluluğuyla paylaş.
          </p>
          <div className="home-actions">
            <Link href="/muzik" className="home-primary-action">
              Müzik odasına geç <ArrowRight size={17} strokeWidth={1.8} />
            </Link>
            <Link href="/top/10" className="home-secondary-action">
              <Trophy size={16} strokeWidth={1.6} /> Listeleri keşfet
            </Link>
          </div>
          <div className="home-proof">
            <span className="home-proof-line" />
            <span>Dinle · Keşfet · Paylaş</span>
          </div>
        </div>

        <VinylArtwork />
      </section>

      <section className="home-destinations" aria-labelledby="home-destinations-title">
        <div className="home-destinations-heading">
          <div>
            <p className="home-eyebrow"><span /> PLATFORM</p>
            <h2 id="home-destinations-title">Stüdyoyu<br /><em>keşfet.</em></h2>
          </div>
          <p className="home-destinations-summary">Dinleme, keşif, paylaşım ve topluluk araçlarına tek yerden ulaş.</p>
        </div>
        <div className="home-destination-grid">
          {destinations.map(({ number, icon: Icon, title, description, href, action, style }) => (
            <article className={`home-destination ${style ? `home-destination-${style}` : ""}`} key={number}>
              <div className="home-destination-top">
                <span className="home-destination-number">{number}</span>
                <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <Link href={href} className="home-destination-link">{action}<ArrowRight size={14} /></Link>
              {number === "02" && (
                <div className="home-chart-shortcuts" aria-label="Diğer listeler">
                  <Link href="/top/20">Yeni Keşifler</Link>
                  <Link href="/top/50">Arşiv</Link>
                </div>
              )}
              {number === "05" && (
                <div className="home-chart-shortcuts" aria-label="Hesap sayfaları">
                  <Link href="/profile">Profilim</Link>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <Link href="/" className="home-footer-brand">THENDISCH STUDIO</Link>
        <span>© 2026 · Müziğin buluşma noktası.</span>
        <Link href="/muzik" className="home-footer-link">Frekansa katıl <ArrowRight size={14} /></Link>
      </footer>
    </main>
  );
}
