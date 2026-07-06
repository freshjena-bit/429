import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5;       
const WINDOW_MS = 10 * 1000; 

// Fungsi untuk membuat ID acak persis seperti format Vercel (iad1::xxxxx-xxxx-xxxx)
function generateVercelId(region: string): string {
  const randomHex = (length: number) => [...Array(length)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  const timestamp = Date.now().toString(16); // Timestamp heksadesimal
  return `${region}::${randomHex(4)}-${timestamp}-${randomHex(12)}`;
}

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
  const now = Date.now();

  const userData = rateLimitMap.get(ip);

  if (!userData || now - userData.lastReset > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
  } else {
    userData.count++;

    if (userData.count > RATE_LIMIT) {
      // Buat ID unik baru setiap kali error muncul
      const vercelErrorId = generateVercelId('iad1'); // Bisa diganti lhr1, sfo1, dll

      // HTML EXACT REPLICA dari Error Runtime Vercel
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
              padding: 0;
              background-color: #fff;
              color: #000;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .error-container {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 32px;
              max-width: 600px;
              width: 100%;
              margin: 0 16px;
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            }
            h1 {
              font-size: 18px;
              font-weight: 600;
              margin: 0 0 24px 0;
              line-height: 1.4;
            }
            .details {
              font-size: 14px;
              color: #666;
              line-height: 1.8;
            }
            code {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
              background-color: #f3f4f6;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 13px;
              color: #111827;
              word-break: break-all;
            }
            .info-box {
              margin-top: 24px;
              padding: 16px;
              background-color: #eff6ff;
              border: 1px solid #dbeafe;
              border-radius: 6px;
              cursor: pointer;
              transition: background-color 0.2s;
            }
            .info-box:hover {
              background-color: #dbeafe;
            }
            .info-box p {
              margin: 0;
              font-size: 13px;
              color: #1e40af;
              line-height: 1.5;
            }
            .info-box strong {
              display: block;
              margin-bottom: 4px;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>429: TOO_MANY_REQUESTS</h1>
            <div class="details">
              <p><strong>Code:</strong> <code>INTERNAL_FUNCTION_RATE_LIMIT</code></p>
              <p><strong>ID:</strong> <code>${vercelErrorId}</code></p>
            </div>
            
            <!-- Kotak Biru Khas Vercel -->
            <div class="info-box">
              <p>
                <strong>What went wrong?</strong>
                This serverless function has exceeded its concurrency limit. 
                <br>Click to view documentation.
              </p>
            </div>
          </div>
        </body>
        </html>`;

      return new NextResponse(htmlContent, {
        status: 429,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Retry-After': '10',
          'X-Vercel-Error-Code': 'INTERNAL_FUNCTION_RATE_LIMIT', // Header asli Vercel
          'X-Vercel-Error-Id': vercelErrorId                    // Header asli Vercel
        }
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/api/:path*'],
};
