// Fix: Removed the problematic '/// <reference types="vite" />' as it causes "Cannot find type definition" errors in this environment.
// Manual type declarations for ImportMetaEnv and ImportMeta below provide the necessary type safety for import.meta.env.
/**
 * Fixed: Cannot find type definition file for 'vite/client'.
 * We provide manual type declarations for ImportMetaEnv and ImportMeta to ensure 
 * the project remains type-safe for Supabase environment variables even if 
 * the external 'vite/client' type definitions cannot be resolved.
 */

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ADMIN_PASSPHRASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
