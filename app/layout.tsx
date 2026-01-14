'use client';

import { Inter } from 'next/font/google'
import './globals.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from '@/components/Navbar'
import { useEffect } from 'react'
import { initTelegramWebApp } from '@/lib/telegram'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Инициализация Telegram Web App после загрузки скрипта
    const timer = setTimeout(() => {
      initTelegramWebApp();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="uz">
      <head>
        <title>ImportMobile</title>
        <meta name="description" content="ImportMobile - Telegram Web App Marketplace" />
      </head>
      <body className={inter.className}>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
          onLoad={() => {
            initTelegramWebApp();
          }}
        />
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  )
}
