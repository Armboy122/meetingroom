import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PopupProvider } from '@/components/ui/popup'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Meeting Room Booking System',
  description: 'Book meeting rooms efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold">ระบบจองห้องประชุม อาคาร SCADA</h1>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
        <PopupProvider />
      </body>
    </html>
  )
}