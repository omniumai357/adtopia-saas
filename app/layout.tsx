import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './styles/globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AdTopia - AI-Powered Revenue Empire Platform',
  description: 'Transform your business with intelligent marketing automation and revenue scaling',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
