export function isLocalAuthMode(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_MODE !== 'supabase';
}
