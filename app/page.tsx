import { ArrowRight, ArrowUpRight, Trophy, Radio, Upload, UsersRound, UserRound, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SiteNavigation } from "@/components/SiteNavigation";
import { BrandIcon, type BrandIconName } from "@/components/BrandIcon";

const destinations = [
  { number: "01", icon: Radio, title: "Canlı akışa katıl", description: "Bir parça açılır, yeni bir sohbet başlar. Birlikte dinle, sıradaki sesi keşfet.", href: "/muzik", action: "Müzik odasına gir", style: "featured" },
  { number: "02", icon: Trophy, title: "Yeni sesler keşfet", description: "Topluluğun seçtiği parçalar, yeni keşifler ve yeniden dinlemek isteyeceğin sesler.", href: "/top/10", action: "Top 10'u keşfet", style: "" },
  { number: "03", icon: Upload, title: "Sıra senin sesinde", description: "Parçanı paylaş. Hikâyene eşlik edecek dinleyicilerle burada buluş.", href: "/yukle", action: "Parçanı paylaş", style: "" },
  { number: "04", icon: UsersRound, title: "Birlikte daha çok", description: "Müziği paylaşan, dinleyen ve yeni seslere alan açan insanları tanı.", href: "/liderler", action: "Topluluğu tanı", style: "" },
  { number: "05", icon: UserRound, title: "Burada bir yerin var", description: "Profilini oluştur, paylaştığın parçaları ve dinleme geçmişini tek yerde tut.", href: "/login", action: "Giriş yap veya katıl", style: "" },
];

const channels = [
  { name: "Saz Band", image: "sazband", href: "https://www.youtube.com/@sazbandmusic" },
  { name: "Mustafa İnce", image: "mustafa-ince", href: "https://www.youtube.com/@mustafaincemuzik" },
  { name: "DJ Thendisch", image: "dj-thendisch", href: "https://www.youtube.com/@DjThendisch" },
  { name: "Serdar Ateş", image: "serdar-ates", href: "https://www.youtube.com/@serdaratesmuzik" },
];

const socialLinks: { label: string; icon: BrandIconName; caption: string; href: string }[] = [
  { label: "Spotify", icon: "spotify", caption: "Müziğimi dinle", href: "https://open.spotify.com/intl-tr/artist/57s3u3Z5MuRnvupktxaPSB" },
  { label: "Instagram", icon: "instagram", caption: "Stüdyodan anlar", href: "https://www.instagram.com/thendisch.studio/" },
  { label: "TikTok", icon: "tiktok", caption: "Yeni videoları keşfet", href: "https://www.tiktok.com/@thendisch/" },
  { label: "Facebook", icon: "facebook", caption: "Gelişmeleri takip et", href: "https://www.facebook.com/thendisch/" },
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
          <p className="home-eyebrow"><span /> THENDISCH STUDIO · MÜZİK · MEDYA · DİJİTAL PROJELER</p>
          <h1 id="home-title" className="home-title">
            Sesini duyur.
            <span>İzini bırak.</span>
          </h1>
          <p className="home-description">
            Yeni seslere kulak ver. Kendi hikâyeni müzikle anlat. Üreten ve dinleyen herkes için Thendisch Studio.
          </p>
          <div className="home-actions">
            <Link href="/muzik" className="home-primary-action">
              Canlı akışa katıl <ArrowRight size={17} strokeWidth={1.8} />
            </Link>
            <Link href="/top/10" className="home-secondary-action">
              <Trophy size={16} strokeWidth={1.6} /> Yeni sesler keşfet
            </Link>
          </div>
          <div className="home-proof">
            <span className="home-proof-line" />
            <span>Birlikte dinle. Birlikte üret.</span>
          </div>
        </div>

        <VinylArtwork />
      </section>

      <section className="home-about" aria-labelledby="home-about-title">
        <div className="home-about-portrait">
          <Image src="/images/studio/thendisch.webp" alt="Thendisch" width={960} height={960} unoptimized />
          <span className="home-portrait-caption">THENDISCH / STUDIO</span>
        </div>
        <div className="home-about-copy">
          <p className="home-eyebrow"><span /> HAKKIMDA</p>
          <h2 id="home-about-title">Her sesin<br /><em>bir hikâyesi var.</em></h2>
          <p>Ben Thendisch. Müzik kanalları ve dijital projeler yönetiyorum. Üretimlerin kendi kimliğini bulması, doğru insanlara ulaşması ve kalıcı bir iz bırakması için çalışıyorum.</p>
        </div>
      </section>

      <section className="home-destinations" aria-labelledby="home-destinations-title">
        <div className="home-destinations-heading">
          <div>
            <p className="home-eyebrow"><span /> PLATFORM</p>
            <h2 id="home-destinations-title">Senin sesin.<br /><em>Senin alanın.</em></h2>
          </div>
          <p className="home-destinations-summary">Dinlemek, paylaşmak ve bağlantı kurmak için ihtiyacın olan her şey burada.</p>
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

      <section className="home-projects" id="projects" aria-labelledby="home-projects-title">
        <div className="home-projects-heading">
          <div>
            <p className="home-eyebrow"><span /> PROJELER</p>
            <h2 id="home-projects-title">Farklı sesler.<br /><em>Ortak bir vizyon.</em></h2>
          </div>
          <p className="home-destinations-summary">Birlikte çalıştığım kanalları tanı. Kendi parçanla bu hikâyenin bir parçası ol.</p>
        </div>

        <a className="home-submission-card" href="https://mais.thendisch.com/" aria-label="Sizden Gelenler — şarkını gönder">
          <span className="home-project-index">01 <span>/</span> HAFTALIK PROGRAM</span>
          <span className="home-mais-icon"><Send size={20} strokeWidth={1.5} aria-hidden="true" /></span>
          <span className="home-submission-copy">
            <span className="home-project-overline">MUSTAFA İNCE YOUTUBE KANALI</span>
            <strong>SİZDEN GELENLER</strong>
            <span className="home-project-description">Mustafa İNCE youtube kanalının haftalık programı sizden gelenlere katılmak için şarkını gönder</span>
          </span>
          <span className="home-project-action">Şarkını gönder <ArrowUpRight size={19} strokeWidth={1.6} /></span>
        </a>

        <div className="home-channel-heading">
          <span className="home-project-index">02 <span>/</span> YOUTUBE KANALLARI</span>
          <span>Birlikte çalıştığım kanallar</span>
        </div>
        <div className="home-channel-grid">
          {channels.map((channel) => (
            <a className="home-channel-card" href={channel.href} target="_blank" rel="noopener noreferrer" key={channel.name}>
              <span className="home-channel-image">
                <Image src={`/images/studio/${channel.image}.webp`} alt="" width={480} height={480} unoptimized />
              </span>
              <span className="home-channel-copy">
                <strong>{channel.name}</strong>
                <span><BrandIcon name="youtube" /> YouTube kanalı</span>
              </span>
              <ArrowUpRight className="home-channel-arrow" size={15} strokeWidth={1.6} aria-hidden="true" />
            </a>
          ))}
        </div>

      </section>

      <section className="home-social" aria-labelledby="home-social-title">
        <div className="home-social-heading">
          <div>
            <p className="home-eyebrow"><span /> BAĞLANTIDA KAL</p>
            <h2 id="home-social-title">Stüdyo hep açık.</h2>
          </div>
          <p>Yeni parçalar, yaratım süreci ve stüdyodan anlar. İstediğin platformdan bize katıl.</p>
        </div>
        <div className="home-social-grid">
          {socialLinks.map((social) => (
            <a className={`home-social-card home-social-${social.icon}`} href={social.href} target="_blank" rel="noopener noreferrer" key={social.label}>
              <BrandIcon name={social.icon} className="home-social-logo" />
              <span className="home-social-copy"><strong>{social.label}</strong><span>{social.caption}</span></span>
              <ArrowUpRight className="home-social-arrow" size={20} aria-hidden="true" />
            </a>
          ))}
        </div>
        <a className="home-contact" href="mailto:info@thendisch.com">
          <BrandIcon name="mail" />
          <span><span>Bir fikrin mi var? Birlikte üretelim.</span><strong>info@thendisch.com</strong></span>
          <ArrowUpRight size={24} aria-hidden="true" />
        </a>
      </section>

      <footer className="home-footer">
        <Link href="/" className="home-footer-brand">THENDISCH STUDIO</Link>
        <span>© 2026 · Müzik, medya ve dijital projeler.</span>
        <Link href="/muzik" className="home-footer-link">Canlı akışa katıl <ArrowRight size={14} /></Link>
      </footer>
    </main>
  );
}
