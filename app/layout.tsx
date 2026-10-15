import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CartProvider } from '@/lib/cart-context'
import { AuthProvider } from '@/lib/auth-context'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Mrittika — Verified Sustainable Goods',
    template: '%s | Mrittika',
  },
  description:
    'A curated multi-vendor marketplace for sustainable, ethically produced goods — with a verified sustainability scoring engine and personal impact tracking.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="flex flex-col min-h-screen font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
