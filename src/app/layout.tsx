import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/context/theme-context'; // Added ThemeProvider

export const metadata: Metadata = {
  title: 'SmartChef',
  description: 'AI Powered Recipe Generator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>{/* Removed className="dark", added suppressHydrationWarning */}
      <head>
        {/* Removed Google Fonts links for Poppins */}
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false} // Explicitly disable system preference if we want app default to be dark
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
