import { ReactNode } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProfileMenu } from "@/components/admin-profile-menu"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="font-heading font-semibold text-lg text-slate-800">Admin Portal</h2>
          <div className="flex items-center gap-4">
            <AdminProfileMenu />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
