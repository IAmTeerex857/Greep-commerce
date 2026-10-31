import { siInstagram, siPinterest, siTiktok, siWhatsapp, siX } from "simple-icons";

/*
 * Real app icons (glyphs from simple-icons, CC0). Solid fills only.
 * Kinds keep their old names so existing call sites keep working:
 * video = TikTok, camera = Instagram, chat = WhatsApp, x = X, pin = Pinterest.
 */
export type AppKind = "video" | "camera" | "chat" | "x" | "pin";

const APPS: Record<AppKind, { name: string; path: string; bg: string }> = {
  video: { name: "TikTok", path: siTiktok.path, bg: "#000000" },
  camera: { name: "Instagram", path: siInstagram.path, bg: "#FF0069" },
  chat: { name: "WhatsApp", path: siWhatsapp.path, bg: "#25D366" },
  x: { name: "X", path: siX.path, bg: "#000000" },
  pin: { name: "Pinterest", path: siPinterest.path, bg: "#E60023" },
};

export const appName = (k: AppKind) => APPS[k].name;

export function AppTile({ kind, size = 34, className = "" }: { kind: AppKind; size?: number | string; className?: string }) {
  const app = APPS[kind];
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-[26%] align-middle shadow-[0_4px_12px_-6px_rgba(0,0,0,.5),inset_0_0_0_1px_rgba(255,255,255,.12)] ${className}`}
      style={{ width: size, height: size, background: app.bg }}
      role="img"
      aria-label={app.name}
    >
      <svg width="56%" height="56%" viewBox="0 0 24 24" aria-hidden="true">
        {kind === "video" && (
          <>
            {/* TikTok's offset glyph: cyan and red copies under the white one */}
            <path d={app.path} fill="#25F4EE" transform="translate(-0.9 -0.7)" />
            <path d={app.path} fill="#FE2C55" transform="translate(0.9 0.7)" />
          </>
        )}
        <path d={app.path} fill="#ffffff" />
      </svg>
    </span>
  );
}

/** Bare brand glyph in the current text colour. */
export function BrandGlyph({ kind, size = 18, className = "" }: { kind: AppKind; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} role="img" aria-label={APPS[kind].name}>
      <path d={APPS[kind].path} fill="currentColor" />
    </svg>
  );
}
