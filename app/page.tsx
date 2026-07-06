"use client";
import { useState } from "react";

export default function Home() {
  const [isAttacking, setIsAttacking] = useState(false);

  const triggerDDoSSimulation = async () => {
    setIsAttacking(true);
    
    // Mengirim 10 request secara bersamaan (simulasi traffic DDoS kecil)
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(fetch('/api/test'));
    }

    // Tunggu semua request selesai
    await Promise.all(promises);

    // Setelah "diserang", lakukan 1 request terakhir untuk membuktikan kita diblokir
    const finalCheck = await fetch('/api/test');
    
    if (finalCheck.status === 429) {
      // Biarkan browser menampilkan HTML 429 yang dibuat oleh middleware
      window.location.href = '/';
    } else {
      alert("Belum kena limit. Coba klik lagi beberapa kali cepat!");
      setIsAttacking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-black" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div className="text-center max-w-md px-6">
        <h1 className="text-2xl font-normal mb-4 text-black">
          Simulasi DDoS / Rate Limit
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Klik tombol di bawah untuk mengirim 10 request secara bersamaan ke server. 
          Middleware akan mendeteksi anomali dan langsung menampilkan halaman 
          <strong> 429: TOO_MANY_REQUESTS </strong> khas Vercel.
        </p>
        
        <button 
          onClick={triggerDDoSSimulation}
          disabled={isAttacking}
          className="px-8 py-3 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:bg-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {isAttacking ? "⏳ Melakukan Serangan..." : "🚀 Trigger 429 Error"}
        </button>

        <p className="text-xs text-gray-400 mt-6">
          Batas Limit: 5 request per 10 detik.
        </p>
      </div>
    </div>
  );
          }
