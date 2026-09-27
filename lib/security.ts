/**
 * CyberSecurity Protective Layer for Cipher Club Website
 * Provides:
 * 1. Anti-DDoS / Rate Limiting (Token Bucket / Sliding Window)
 * 2. SQL Injection, XSS, and Path Traversal Attack Payload Detection
 * 3. Input Sanitization Helpers
 * 4. Security Header Definitions
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for IP rate limiting
const ipStore = new Map<string, RateLimitStore>();

// Cleanup stale IP records every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipStore.entries()) {
      if (now > data.resetTime) {
        ipStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Get Client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIP = headers.get('x-real-ip');
  if (xRealIP) {
    return xRealIP.trim();
  }
  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }
  return '127.0.0.1';
}

/**
 * Rate Limiter Engine
 * @param ip Client IP
 * @param limit Max allowed requests in timeframe
 * @param windowMs Time frame window in milliseconds (default 1 minute)
 */
export function checkRateLimit(
  ip: string,
  limit: number = 60,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = ipStore.get(ip);

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    ipStore.set(ip, { count: 1, resetTime });
    return { allowed: true, remaining: limit - 1, resetTime };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
}

/**
 * SQL Injection, XSS & Command Injection Attack Signatures
 */
const SQLI_PATTERNS = [
  /'\s*or\s+['"\d]/i,
  /"\s*or\s+['"\d]/i,
  /union\s+(all\s+)?select/i,
  /select\s+.*\s+from/i,
  /insert\s+into/i,
  /delete\s+from/i,
  /drop\s+(table|database)/i,
  /exec(\s|\+)+(sp_|xp_)/i,
  /information_schema/i,
  /sleep\(\s*\d+\s*\)/i,
  /pg_sleep\(/i,
  /benchmark\(/i,
];

const XSS_PATTERNS = [
  /<script\b[^>]*>/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /onload\s*=/i,
  /onerror\s*=/i,
  /onclick\s*=/i,
  /onmouseover\s*=/i,
  /<iframe\b[^>]*>/i,
  /document\.cookie/i,
  /eval\s*\(/i,
];

const PATH_TRAVERSAL_PATTERNS = [
  /\.\.[\/\\]/,
  /%2e%2e%2f/i,
  /%2e%2e%5c/i,
  /%2e%2e\//i,
];

/**
 * Inspect input string or URL query for dangerous threat vectors
 */
export function detectSecurityThreat(input: string): { threatDetected: boolean; type?: string } {
  if (!input) return { threatDetected: false };

  const decodedInput = decodeURIComponent(input);

  // Check SQL Injection
  for (const pattern of SQLI_PATTERNS) {
    if (pattern.test(decodedInput)) {
      return { threatDetected: true, type: 'SQL_INJECTION' };
    }
  }

  // Check Cross-Site Scripting (XSS)
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(decodedInput)) {
      return { threatDetected: true, type: 'XSS_ATTACK' };
    }
  }

  // Check Path Traversal
  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(decodedInput)) {
      return { threatDetected: true, type: 'PATH_TRAVERSAL' };
    }
  }

  return { threatDetected: false };
}

/**
 * Sanitize string input to prevent XSS injection
 */
export function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Standard Security Headers
 */
export const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};
