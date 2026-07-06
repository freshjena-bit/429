import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "429 Error Simulation",
  description: "Simulasi DDoS dan Rate Limiting Vercel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
