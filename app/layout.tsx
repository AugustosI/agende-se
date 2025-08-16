import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Agende-se - Sistema de Agendamento",
  description: "Sistema web responsivo para gerenciar agendas de clientes e controle financeiro para prestadores de serviços",
  manifest: "/manifest.json",
    generator: 'v0.dev'
  // Removed unsupported fields
  // themeColor and viewport will be added as meta tags in the head
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Agende-se" />
  {/* Move themeColor and viewport to explicit meta tags to satisfy Next's metadata validation for Edge runtime */}
  <meta name="theme-color" content="#f43f5e" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}