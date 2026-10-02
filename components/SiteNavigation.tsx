import Link from "next/link";
import type { ReactNode } from "react";

type SiteNavigationProps = {
  active?: "home" | "music" | "charts" | "community" | "projects";
  actions?: ReactNode;
};

const links = [
  { label: "Ana Sayfa", href: "/", key: "home" },
  { label: "Müzik Odası", href: "/muzik", key: "music" },
  { label: "Top 10", href: "/top/10", key: "charts" },
  { label: "Topluluk", href: "/liderler", key: "community" },
  { label: "Projeler", href: "/#projects", key: "projects" },
] as const;

export function SiteNavigation({ active, actions }: SiteNavigationProps) {
  return (
    <header className="studio-site-header">
      <div className="studio-site-header-main">
        <Link href="/" className="studio-site-brand" aria-label="Thendisch Studio ana sayfa">
          <svg className="studio-site-logo" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <path d="M8 11h48v5H35v29h8l-3 6H24l-3-6h8V16H8z" fill="currentColor" />
          </svg>
          <span className="studio-site-brand-copy">
            <span className="studio-site-brand-name">THENDISCH STUDIO</span>
            <span className="studio-site-brand-sub">Müzik · Medya · Dijital projeler</span>
          </span>
        </Link>
        <div className="studio-site-header-actions">
          {!actions && <Link href="/yukle" className="studio-site-upload">Şarkını yükle</Link>}
          {actions || <Link href="/login" className="studio-site-account">Giriş / Üyelik</Link>}
        </div>
      </div>
      <nav className="studio-site-nav" aria-label="Site bölümleri">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className="studio-site-nav-link"
            aria-current={active === link.key ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/top/20" className="studio-site-nav-link studio-site-nav-extra">Yeni Keşifler</Link>
        <Link href="/top/50" className="studio-site-nav-link studio-site-nav-extra">Arşiv</Link>
      </nav>
    </header>
  );
}
