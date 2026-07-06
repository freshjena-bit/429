import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simulasi Database Sementara (In-Memory)
// CATATAN: Di server Edge Vercel yang terdistribusi, state ini hanya berlaku per-server.
// Untuk produksi, ganti bagian ini dengan Vercel KV (Redis).
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT = 5;       // Batas maksimal request
const WINDOW_MS = 10 * 1000; // Jendela waktu (10 detik) - dibuat cepat untuk keperluan testing

export function middleware(request: NextRequest) {
  // 1. Ambil IP pengguna
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
  const now = Date.now();

  // 2. Cek hitungan request sebelumnya
  const userData = rateLimitMap.get(ip);

  if (!userData || now - userData.lastReset > WINDOW_MS) {
    // Jika belum ada data atau waktu sudah reset, mulai hitungan baru
    rateLimitMap.set(ip, { count: 1, lastReset: now });
  } else {
    // Jika ada, tambahkan hitungan
    userData.count++;

    // 3. Jika melebihi batas -> TAMPILKAN ERROR 429 VERCEL PALSU
    if (userData.count > RATE_LIMIT) {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>429: TOO_MANY_REQUESTS</title>
          <style>
            body { margin: 0; color: #000; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
            .c { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
            .i { display: inline-block; text-align: left; max-width: 520px; }
            h1 { font-size: 24px; font-weight: 400; margin: 0 0 16px; padding: 0; line-height: 1.3; }
            p { font-size: 14px; font-weight: 400; line-height: 1.5; color: #666; margin: 0; }
          </style>
        </head>
        <body>
          <div class="c">
            <div class="i">
              <h1>429: TOO_MANY_REQUESTS</h1>
              <p>Too many requests, please try again later.</p>
            </div>
          </div>
        </body>
        </html>`;

      // Kembalikan respons HTML dengan status 429
      return new NextResponse(htmlContent, {
        status: 429,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Retry-After': '10', // Memberitahu browser untuk coba lagi dalam 10 detik
        }
      });
    }
  }

  // 4. Jika di bawah batas, izinkan request lanjut ke halaman/API
  return NextResponse.next();
}

// Konfigurasi path mana yang akan dijaga oleh middleware ini
export const config = {
  matcher: [
    '/',           // Lindungi halaman utama
    '/api/:path*', // Lindungi semua API route
  ],
};
