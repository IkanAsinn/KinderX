"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { StudentDetailDialog } from "@/components/student-detail-dialog"

type Parent = {
  id: string
  full_name: string
}

type Student = {
  id: string
  nisn: string | null
  full_name: string
  parent_id: string | null
  date_of_birth: string | null
  gender: string | null
  profile_picture: string | null
  created_at: string
  parent: { full_name: string } | null | any
}

function calculateAge(dob: string | null) {
  if (!dob) return "-"
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return `${age} Thn`
}

export function StudentsDataTable({ initialData, parents }: { initialData: Student[], parents: Parent[] }) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredStudents = initialData.filter((student) => {
    const query = searchQuery.toLowerCase()
    const matchName = student.full_name.toLowerCase().includes(query)
    const matchNisn = student.nisn?.toLowerCase().includes(query) || false
    return matchName || matchNisn
  })

  return (
    <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau NISN..." 
            className="pl-11 h-11 rounded-xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-indigo-500"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto p-2">
        <Table>
          <TableHeader className="bg-slate-50/70">
            <TableRow className="border-none">
              <TableHead className="w-[150px] text-slate-600 font-semibold py-5 px-6 rounded-l-xl">Siswa</TableHead>
              <TableHead className="text-slate-600 font-semibold py-5 px-6">NISN</TableHead>
              <TableHead className="text-slate-600 font-semibold py-5 px-6">Orang Tua/Wali</TableHead>
              <TableHead className="text-slate-600 font-semibold py-5 px-6">Tgl Daftar</TableHead>
              <TableHead className="text-center text-slate-600 font-semibold py-5 px-6 rounded-r-xl">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents && filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center font-semibold text-slate-500">
                        {student.profile_picture ? (
                          <img src={student.profile_picture} alt={student.full_name} className="h-full w-full object-cover" />
                        ) : (
                          student.full_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{student.full_name}</span>
                        <span className="text-xs text-slate-500 mt-0.5">
                          {student.gender === 'L' ? 'Laki-laki' : student.gender === 'P' ? 'Perempuan' : '-'} • {calculateAge(student.date_of_birth)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-700 py-4 px-6">{student.nisn || '-'}</TableCell>
                  <TableCell className="text-slate-500 py-4 px-6">
                    {student.parent?.full_name || <span className="text-amber-600 text-xs font-semibold px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg">Belum ditautkan</span>}
                  </TableCell>
                  <TableCell className="text-slate-500 py-4 px-6">
                    {new Date(student.created_at).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell className="text-center py-4 px-6">
                    <StudentDetailDialog student={student} parents={parents} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-slate-400 mb-2">Tidak ada data siswa</span>
                    <p className="text-sm">Silakan tambahkan siswa baru atau import dari Excel.</p>
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
