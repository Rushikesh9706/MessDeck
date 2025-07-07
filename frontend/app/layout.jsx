import './globals.css';
// import type { Metadata } from 'next';
import { Toaster } from "../components/ui/sonner.jsx";

export const metadata = {
  title: 'MessDeck - Smart Mess Management',
  description: 'Complete mess management solution with digital wallet and smart booking',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}