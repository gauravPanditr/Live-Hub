// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'My App',
  description: 'Streaming platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className="dark">
        <body className={inter.className}>
          <ThemeProvider attribute="class" forcedTheme="dark">
            <Toaster theme="light" position="bottom-center" />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
