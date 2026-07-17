import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { AddStudentDialog } from "@/components/add-student-dialog"
import { ImportStudentsDialog } from "@/components/import-students-dialog"
import { StudentsDataTable } from "./students-data-table"

export default async function StudentsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        }
      }
    }
  )

  const { data: students } = await supabase
    .from('students')
    .select(`
      id,
      nisn,
      full_name,
      parent_id,
      date_of_birth,
      gender,
      profile_picture,
      created_at,
      parent:parent_id(full_name)
    `)
    .order('created_at', { ascending: false })

  const { data: parents } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('role', 'parent')
    .order('full_name')

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Data Siswa</h1>
          <p className="text-slate-500 mt-1">Kelola data siswa dan tautkan dengan orang tua.</p>
        </div>
        <div className="flex items-center gap-4">
          <ImportStudentsDialog />
          <AddStudentDialog parents={parents || []} />
        </div>
      </div>

      <StudentsDataTable initialData={students || []} parents={parents || []} />
    </div>
  )
}
