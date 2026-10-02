export type BrandIconName = "spotify" | "instagram" | "tiktok" | "facebook" | "youtube" | "google" | "mail";

type BrandIconProps = { name: BrandIconName; className?: string; size?: number };

const assets = {
  spotify: "/brands/spotify.png",
  instagram: "/brands/instagram.svg",
  tiktok: "/brands/tiktok.png",
  facebook: "/brands/facebook.png",
  youtube: "/brands/youtube.svg",
  google: "/brands/google.svg",
} as const;

/** Company artwork is served unchanged from each owner's published resources. */
export function BrandIcon({ name, className, size = 24 }: BrandIconProps) {
  if (name !== "mail") {
    return <img src={assets[name]} width={size} height={size} className={className} alt="" aria-hidden="true" style={{ objectFit: "contain" }} />;
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      <rect x="3" y="5" width="18" height="14" />
      <path d="m3.5 6 8.5 7L20.5 6" />
    </svg>
  );
}
