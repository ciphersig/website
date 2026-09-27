import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getClientIP, checkRateLimit, detectSecurityThreat, SECURITY_HEADERS } from '@/lib/security';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Inspect URL Query Strings & Path for Security Threats (SQLi, XSS, Path Traversal)
  const urlCheck = detectSecurityThreat(search ? `${pathname}${search}` : pathname);
  if (urlCheck.threatDetected) {
    console.warn(`[SECURITY ALERT] Blocked ${urlCheck.type} attempt from IP: ${getClientIP(request.headers)} on ${pathname}`);
    return NextResponse.json(
      {
        error: 'Security Policy Violation: Malicious payload or attack signature detected.',
        code: 'SEC_THREAT_BLOCKED',
      },
      { status: 400 }
    );
  }

  // 2. Anti-DDoS & Rate Limiting for API Routes
  if (pathname.startsWith('/api/')) {
    const clientIP = getClientIP(request.headers);
    
    // Stricter rate limit for write/POST/Admin actions (15 req/min), standard for GETs (60 req/min)
    const isSensitiveRoute =
      pathname.startsWith('/api/register') ||
      pathname.startsWith('/api/contact') ||
      pathname.startsWith('/api/admin') ||
      pathname.startsWith('/api/feedback') ||
      pathname.startsWith('/api/email');

    const limit = isSensitiveRoute ? 15 : 60;
    const rateLimitResult = checkRateLimit(clientIP, limit, 60 * 1000);

    if (!rateLimitResult.allowed) {
      console.warn(`[SECURITY ALERT] Rate limit exceeded for IP: ${clientIP} on ${pathname}`);
      const rateLimitResponse = NextResponse.json(
        {
          error: 'Rate limit exceeded. Cyber Security DDoS protection active.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
          },
        }
      );
      
      // Attach security headers
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        rateLimitResponse.headers.set(key, value);
      });

      return rateLimitResponse;
    }
  }

  // 3. Process Request & Attach Security Headers to Response
  const response = NextResponse.next();

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Apply middleware to API routes and general pages, excluding static files & assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, videos (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|mp4|webm|ogg|mp3|wav|lottie)$).*)',
  ],
};
