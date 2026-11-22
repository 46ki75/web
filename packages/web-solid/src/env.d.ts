/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL: string;
  readonly VITE_SITE_BUILD_DATE: string;
  readonly SNAPSHOT_DIR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
