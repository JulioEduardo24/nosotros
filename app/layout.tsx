import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nosotros',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-white">
        {children}
      </body>
    </html>
  )
}