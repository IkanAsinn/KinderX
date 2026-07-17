"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Users, LayoutDashboard, Settings, GraduationCap, FileText } from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Siswa", icon: Users },
  { href: "/admin/teachers", label: "Guru", icon: GraduationCap },
  { href: "/admin/classes", label: "Kelas", icon: BookOpen },
  { href: "/admin/reports", label: "Laporan", icon: FileText },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      <div className="p-6">
        <div className="flex items-center justify-center mb-4 mt-2">
          <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shadow-md bg-white border border-slate-100 flex items-center justify-center">
            <img src="/logo.png" alt="KinderX Logo" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = item.href === "/admin" 
            ? pathname === "/admin"
            : pathname.startsWith(item.href)
            
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <Link 
          href="/admin/settings" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
            pathname.startsWith("/admin/settings")
              ? "bg-primary/10 text-primary"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Settings size={20} />
          Pengaturan
        </Link>
      </div>
    </aside>
  )
}
