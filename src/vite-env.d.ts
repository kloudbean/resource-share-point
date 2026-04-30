/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Canonical site URL for Open Graph images (e.g. https://portal.yourbrokerage.com). No trailing slash. */
  readonly VITE_PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
