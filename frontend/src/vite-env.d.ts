/// <reference types="vite/client" />

// Declares the optional build-time API endpoint exposed by Vite.
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

// Augments import.meta with the environment object used by api.ts.
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
