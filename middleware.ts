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
<style>
  body {
    margin: 0;
    background-color: #fff;
    color: #000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
</style>
</head>
<body>
<div style="border: 1px solid rgb(229 231 235); border-radius: 0.25rem; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); padding: 1.5rem; max-width: 36rem; width: 100%; margin: 0 1rem;">
  <h1 style="font-size: 1.125rem; font-weight: 600; margin: 0 0 1rem 0; line-height: 1.75rem;">429: TOO_MANY_REQUESTS</h1>
  <p style="font-size: 0.875rem; color: rgb(107 114 128); margin: 0 0 0.5rem 0; line-height: 1.25rem;">Code: <code style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.8125rem; background: rgb(243 244 246); padding: 0.125rem 0.3125rem; border-radius: 0.25rem; color: rgb(17 24 39);">INTERNAL_FUNCTION_RATE_LIMIT</code></p>
  <p style="font-size: 0.875rem; color: rgb(107 114 128); margin: 0; line-height: 1.25rem;">ID: <code style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.8125rem; background: rgb(243 244 246); padding: 0.125rem 0.3125rem; border-radius: 0.25rem; color: rgb(17 24 39);">lhr1::258d8-1638206292557-de4add7172e7</code></p>
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
