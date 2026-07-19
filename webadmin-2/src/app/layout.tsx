import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Labour Connect Nepal - Company Admin",
  description: "Company Admin Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col m-0 p-0 overflow-hidden">
        <div className="min-h-screen flex bg-slate-50 w-full">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-lg">
            <div className="p-6 border-b border-slate-800">
              <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Portal</h1>
              <p className="text-sm mt-1 text-slate-500">Company Admin</p>
            </div>
            <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
              <Link href="/" className="px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                Profile & Branches
              </Link>
              <Link href="/fleet" className="px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                Fleet Management
              </Link>
              <Link href="/dispatch" className="px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                Manual Dispatch
              </Link>
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto h-screen">
            <header className="bg-white px-8 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-lg font-semibold text-slate-800">BuildWell Construction Pvt. Ltd.</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-500">Subscription: Growth Tier</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">ACTIVE</span>
              </div>
            </header>
            <div className="p-8 pb-16">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
