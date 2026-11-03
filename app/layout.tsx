import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const APP_TITLE = "Buzzini Shoe Coach | Qual tênis usar hoje?";
const APP_DESCRIPTION =
  "Descubra qual é o tênis ideal para o seu treino de corrida hoje entre os que você tem, ou receba indicações certeiras de compra com a inteligência da Buzzini Assessoria Esportiva.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://tenis.buzzini.com.br"
  ),
  title: {
    default: APP_TITLE,
    template: "%s | Buzzini Assessoria Esportiva",
  },
  description: APP_DESCRIPTION,
  applicationName: "Buzzini Shoe Coach",
  authors: [{ name: "Buzzini Assessoria Esportiva" }],
  generator: "Next.js",
  keywords: [
    "Buzzini",
    "Buzzini Assessoria Esportiva",
    "Tênis de Corrida",
    "Qual tênis usar",
    "Corrida de rua",
    "Treino de tiro",
    "Longão",
    "Placa de carbono",
    "Recomendação de tênis",
  ],
  creator: "Buzzini",
  publisher: "Buzzini Assessoria Esportiva",
  category: "Sports",

  // Open Graph (WhatsApp, Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Buzzini Shoe Coach",
    title: "Buzzini Shoe Coach 👟 Qual tênis calçar no seu treino hoje?",
    description: APP_DESCRIPTION,
  },

  // Twitter / X Card
  twitter: {
    card: "summary_large_image",
    title: "Buzzini Shoe Coach 👟 Qual tênis calçar no seu treino hoje?",
    description: APP_DESCRIPTION,
  },

  // Ícones
  icons: {
    icon: [
      { url: "/logo_buzzini.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo_buzzini.svg", type: "image/svg+xml" },
    ],
  },

  // Robôs de busca
  robots: {
    index: true,
    follow: true,
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
        <SpeedInsights />
      </body>
    </html>
  );
}
