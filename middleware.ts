import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5;       
const WINDOW_MS = 10 * 1000; 

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
  const now = Date.now();

  const userData = rateLimitMap.get(ip);

  if (!userData || now - userData.lastReset > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
  } else {
    userData.count++;

    if (userData.count > RATE_LIMIT) {
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>429: TOO_MANY_REQUESTS</title>
<style>body{margin:0;color:#000;background:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh}.c{border:1px solid #e5e7eb;border-radius:.25rem;padding:1.5rem;max-width:36rem;width:100%;margin:0 1rem;box-shadow:0 1px 2px 0 rgba(0,0,0,.05)}h1{font-size:1.125rem;font-weight:600;margin:0 0 1rem 0;line-height:1.75rem}p{font-size:.875rem;color:#6b7280;margin:0 0 .5rem 0;line-height:1.25rem}p:last-child{margin-bottom:0}code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;background:#f3f4f6;padding:.125rem .3125rem;border-radius:.25rem;font-size:.8125rem;color:#111827}</style>
</head>
<body>
<div class="c">
<h1>429: TOO_MANY_REQUESTS</h1>
<p>Code: <code>INTERNAL_FUNCTION_RATE_LIMIT</code></p>
<p>ID: <code>lhr1::258d8-1638206292557-de4add7172e7</code></p>
</div>
</body>
</html>`;

      return new NextResponse(htmlContent, {
        status: 429,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Retry-After': '10',
        }
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/api/:path*'],
};
