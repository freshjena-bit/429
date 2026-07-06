import { NextResponse } from 'next/server';

export async function GET() {
  // Jika request lolos dari middleware, akan mengembalikan JSON ini
  return NextResponse.json({ 
    status: "success", 
    message: "Anda berhasil menembus pertahanan!" 
  });
}
