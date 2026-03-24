import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creative Engine — Build Your World!",
  description: "An AI-powered, gamified app builder for kids",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {children}
      </body>
    </html>
  );
}
