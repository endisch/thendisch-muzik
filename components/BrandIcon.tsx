export type BrandIconName =
  | "spotify"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "youtube"
  | "mail";

type BrandIconProps = {
  name: BrandIconName;
  className?: string;
};

export function BrandIcon({ name, className }: BrandIconProps) {
  const filled = name === "tiktok" || name === "facebook";

  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {name === "spotify" && (
        <>
          <circle cx="12" cy="12" r="9.2" />
          <path d="M6.8 9.5c3.8-1.2 7.8-.8 10.8 1.1M7.7 12.7c3.1-.9 6.2-.5 8.9 1M8.6 15.6c2.4-.6 4.8-.3 6.8.8" />
        </>
      )}
      {name === "instagram" && (
        <>
          <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
          <circle cx="12" cy="12" r="4.1" />
          <circle cx="17.5" cy="6.8" r=".8" fill="currentColor" stroke="none" />
        </>
      )}
      {name === "tiktok" && (
        <path d="M14.2 3h3.1c.2 2.1 1.4 3.8 3.7 4.4v3.2a9.1 9.1 0 0 1-3.7-1.3v6.1a5.7 5.7 0 1 1-5.7-5.7c.5 0 1 .1 1.4.2v3.3a2.5 2.5 0 1 0 1.2 2.1V3z" />
      )}
      {name === "facebook" && (
        <path d="M13.6 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.4V13h2.8v8h3.4z" />
      )}
      {name === "youtube" && (
        <>
          <path d="M21 8.2c-.2-1.4-.7-2-2-2.2-1.8-.3-4.5-.3-7-.3s-5.2 0-7 .3c-1.3.2-1.8.8-2 2.2-.2 1.2-.2 2.4-.2 3.8s0 2.6.2 3.8c.2 1.4.7 2 2 2.2 1.8.3 4.5.3 7 .3s5.2 0 7-.3c1.3-.2 1.8-.8 2-2.2.2-1.2.2-2.4.2-3.8s0-2.6-.2-3.8Z" />
          <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
        </>
      )}
      {name === "mail" && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="1" />
          <path d="m3.5 6 8.5 7L20.5 6" />
        </>
      )}
    </svg>
  );
}
