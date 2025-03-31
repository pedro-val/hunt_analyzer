import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "App Hunt DB",
  description: "App Hunt DB",
  icons: {
    icon: '/nub1.jpg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
