import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TeachersDataTable } from "./teachers-data-table"
import { AddTeacherDialog } from "@/components/add-teacher-dialog"
import { UserCheck } from "lucide-react"

export const metadata = {
  title: "Manajemen Guru | KinderX",
}

export default async function TeachersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect("/login")
  }

  // Verify Admin Role
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (userProfile?.role !== 'admin') {
    return redirect("/login")
  }

  // Note: the auth.users table is not queryable from the client API directly for security.
  // Instead, we get the teachers from our public.users table. 
  // We can't join on auth.users to get the email via RLS unless we do it via a postgres function,
  // but since we stored emails, wait, we didn't store emails in public.users?
  // Let's check our schema. 0001_initial_schema.sql doesn't have email in public.users.
  // If we need the email to display, we could join to auth.users using a secure view or RPC.
  // Or, we can just display the name for now, or update the DB to store email.
  // For now, let's fetch what we have.

  const { data: teachers, error: teachersError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'teacher')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <UserCheck className="text-indigo-500" size={32} />
            Data Guru
          </h1>
          <p className="text-slate-500 mt-2">
            Kelola data staf pengajar, buat kredensial login, dan pantau status aktif guru.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <AddTeacherDialog />
        </div>
      </div>

      {teachersError ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
          Gagal memuat data guru: {teachersError.message}
        </div>
      ) : (
        <TeachersDataTable initialData={teachers || []} />
      )}
    </div>
  )
}
