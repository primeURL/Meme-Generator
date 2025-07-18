"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { Image as ImageIcon, PlusCircle } from 'lucide-react'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <ImageIcon className="w-5 h-5 mr-2" />,
  },
  {
    label: 'Create Meme Template',
    href: '/dashboard/create',
    icon: <PlusCircle className="w-5 h-5 mr-2" />,
  },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-blue-100 shadow-lg flex flex-col py-8 px-4 min-h-screen">
        <div className="mb-10 flex items-center gap-2 px-2">
          <span className="text-2xl font-extrabold text-blue-700 tracking-tight">🖼️ MemeGen</span>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 text-base ${
                pathname === item.href ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <div className="text-xs text-gray-400 px-2 mt-8">© {new Date().getFullYear()} MemeGen</div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-5xl">{children}</div>
      </main>
    </div>
  )
} 