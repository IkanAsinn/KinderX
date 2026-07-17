import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, BookOpen, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

function CuteEmptyBox({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M 20 40 L 20 85 C 20 88 22 90 25 90 L 75 90 C 78 90 80 88 80 85 L 80 40" />
      <path d="M 20 40 L 5 25" />
      <path d="M 80 40 L 95 25" />
      <path d="M 20 40 L 80 40" />
      
      <circle cx="35" cy="65" r="3" fill="currentColor" />
      <circle cx="65" cy="65" r="3" fill="currentColor" />
      <path d="M 45 72 Q 50 78 55 72" />
      
      <path d="M 28 68 L 32 68" strokeWidth="2" opacity="0.5" />
      <path d="M 68 68 L 72 68" strokeWidth="2" opacity="0.5" />
    </svg>
  )
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch actual counts
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })

  const { count: teacherCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'teacher')

  return (
    <div className="p-8 space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold font-heading text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-500">Ringkasan operasional KinderX periode akademik 2026/2027.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-none shadow-sm bg-white px-6 py-4 flex flex-col">
          <div className="flex flex-row items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-slate-500">Total Siswa Aktif</h3>
            <Users className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold font-heading text-slate-900 mb-1">{studentCount || 0}</div>
          <p className="text-xs text-emerald-500 font-medium">Siswa terdaftar</p>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white px-6 py-4 flex flex-col">
          <div className="flex flex-row items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-slate-500">Total Guru</h3>
            <GraduationCap className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold font-heading text-slate-900 mb-1">{teacherCount || 0}</div>
          <p className="text-xs text-slate-400 font-medium">Staf pengajar aktif</p>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white px-6 py-4 flex flex-col">
          <div className="flex flex-row items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-slate-500">Jumlah Kelas</h3>
            <BookOpen className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold font-heading text-slate-900 mb-1">8</div>
          <p className="text-xs text-slate-400 font-medium">Kapasitas rata-rata 20 siswa</p>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white px-6 py-4 flex flex-col">
          <div className="flex flex-row items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-slate-500">Perhatian Khusus</h3>
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </div>
          <div className="text-3xl font-bold font-heading text-slate-900 mb-1">3</div>
          <p className="text-xs text-slate-400 font-medium">Siswa absen beruntun</p>
        </Card>
      </div>
      
      {/* Empty State for Activity */}
      <div className="mt-4 flex-1 flex flex-col">
        <h2 className="text-xl font-bold font-heading mb-4 text-slate-800">Aktivitas Terkini</h2>
        <Card className="rounded-2xl border-none shadow-sm bg-white p-8 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <CuteEmptyBox className="w-24 h-24 text-indigo-200 mb-2" />
            <div className="space-y-1">
              <h3 className="font-heading font-semibold text-lg text-slate-700">Belum ada data terkini</h3>
              <p className="text-sm text-slate-500 max-w-sm">Aktivitas, pengumuman, dan log sistem akan muncul di sini setelah ada interaksi pada platform.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
