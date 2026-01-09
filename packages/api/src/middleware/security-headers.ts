/**
 * Security Headers Middleware
 * Adds security headers to responses
 */

export interface SecurityHeadersConfig {
  csp?: string;
  enableFrameProtection?: boolean;
  enableXssProtection?: boolean;
}

export function getSecurityHeaders(config?: SecurityHeadersConfig): Record<string, string> {
  const defaultCsp = \
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co https://*.kinde.com https://api.stripe.com;
    frame-src 'self' https://js.stripe.com;
  \.replace(/\s{2,}/g, ' ').trim();

  const headers: Record<string, string> = {
    'Content-Security-Policy': config?.csp || defaultCsp,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  if (config?.enableFrameProtection !== false) {
    headers['X-Frame-Options'] = 'DENY';
  }

  if (config?.enableXssProtection !== false) {
    headers['X-XSS-Protection'] = '1; mode=block';
  }

  return headers;
}
