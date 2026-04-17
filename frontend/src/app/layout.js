import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Compliance - AI Compliance Management",
  description: "Semantic regulation analysis and compliance tracking system",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-slate-100 border-t border-slate-200 py-4 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-600">
            <p>
              CodeWizards • AI-Powered Compliance Management System •{" "}
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                API Docs
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
