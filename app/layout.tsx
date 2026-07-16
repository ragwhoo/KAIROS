import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Kairos",
  description: "Your academic operating system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
