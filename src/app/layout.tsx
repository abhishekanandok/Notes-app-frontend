import type { Metadata } from "next";
import { Kalam, Caveat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotesProvider } from "@/contexts/NotesContext";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Notes App",
  description: "Collaborative notes application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${kalam.variable} ${caveat.variable} antialiased font-kalam`}
      >
        <Providers>
          <AuthProvider>
            <NotesProvider>
              <Navbar />
              <div className="pt-24">
                {children}
              </div>
              <Toaster />
            </NotesProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
