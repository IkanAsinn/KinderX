"use client"

import { useState } from "react"
import { Search, Mail, Calendar, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { TeacherDetailDialog } from "@/components/teacher-detail-dialog"

type Teacher = {
  id: string
  full_name: string
  email: string | null
  photo_url: string | null
  created_at: string
}

export function TeachersDataTable({ initialData }: { initialData: Teacher[] }) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTeachers = initialData.filter((teacher) => {
    const query = searchQuery.toLowerCase()
    const matchName = teacher.full_name.toLowerCase().includes(query)
    const matchEmail = teacher.email?.toLowerCase().includes(query) || false
    return matchName || matchEmail
  })

  return (
    <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau email guru..." 
            className="pl-11 h-11 rounded-xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-indigo-500"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto p-2">
        <Table>
          <TableHeader className="bg-slate-50/70">
            <TableRow className="border-none">
              <TableHead className="w-[250px] text-slate-600 font-semibold py-5 px-6 rounded-l-xl">Guru</TableHead>
              <TableHead className="text-slate-600 font-semibold py-5 px-6">Kontak</TableHead>
              <TableHead className="text-slate-600 font-semibold py-5 px-6">Tgl Bergabung</TableHead>
              <TableHead className="text-center text-slate-600 font-semibold py-5 px-6 rounded-r-xl">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers && filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-indigo-50 border border-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600">
                        {teacher.photo_url ? (
                          <img src={teacher.photo_url} alt={teacher.full_name} className="h-full w-full object-cover" />
                        ) : (
                          <User size={18} />
                        )}
                      </div>
                      <span className="font-semibold text-slate-900">{teacher.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Mail size={14} className="text-slate-400" />
                      {teacher.email || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(teacher.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4 px-6">
                    <TeacherDetailDialog teacher={teacher} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-slate-400 mb-2">Tidak ada data guru</span>
                    <p className="text-sm">Silakan tambahkan guru baru.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
