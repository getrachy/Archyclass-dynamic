import './globals.css'

export const metadata = {
  title: 'ArchyClass - Dynamic',
  description: 'Technical Drawing for Nigerian Students',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
