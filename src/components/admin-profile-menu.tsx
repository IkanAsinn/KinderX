"use client"

import { useState } from "react"
import { Users, LogOut } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { logoutAction } from "@/app/actions/auth"

export function AdminProfileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button type="button" className="flex items-center gap-3 text-sm focus:outline-none cursor-pointer hover:opacity-80 transition-opacity">
            <span className="font-medium text-slate-700 hidden sm:block">Administrator</span>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
              <Users size={16} className="text-slate-500" />
            </div>
          </button>
        }
      />
      <PopoverContent align="end" className="w-48 p-2 rounded-2xl shadow-xl">
        <div className="px-3 py-2 border-b border-slate-100 mb-1 sm:hidden">
          <p className="text-sm font-medium text-slate-900">Administrator</p>
        </div>
        <button
          onClick={() => {
            setOpen(false)
            logoutAction()
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Keluar (Sign Out)
        </button>
      </PopoverContent>
    </Popover>
  )
}
