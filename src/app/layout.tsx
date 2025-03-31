import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "App Hunt DB",
  description: "Analisador de hunts de Tibia. Calcule lucros, danos e pagamentos.",
  icons: {
    icon: '/nub1.jpg',
  },
  openGraph: {
    title: 'App Hunt DB',
    description: 'Veja quem são os melhores e os piores jogadores da sua pt!',
    url: 'https://apphundb.vercel.app/', // Replace with your actual URL
    siteName: 'App Hunt DB',
    images: [
      {
        url: '/nub1.jpg', // Use your existing image or create a dedicated preview image
        width: 1200,
        height: 630,
        alt: 'App Hunt DB Preview',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'App Hunt DB',
    description: 'Analisador de hunts para jogadores de Tibia. Calcule lucros, danos e pagamentos automaticamente.',
    images: ['/nub1.jpg'], // Same image as OG or a Twitter-specific one
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
