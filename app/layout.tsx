import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buzzini Shoe Coach | Qual tênis usar hoje?",
  description:
    "Agente inteligente para indicação do melhor tênis para o seu treino de corrida.",
  icons: {
    icon: "/logo_buzzini.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} h-full antialiased bg-neutral-950`}
    >
      <body className="min-h-full bg-neutral-950 text-neutral-100 selection:bg-orange-500 selection:text-white font-sans">
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        {children}
      </body>
    </html>
  );
}
