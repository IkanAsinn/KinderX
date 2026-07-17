"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, FileDown, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import * as xlsx from "xlsx"
import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ImportStudentsDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast.error("Tidak ada file", { description: "Pilih file .xlsx terlebih dahulu." })
      return
    }

    setIsLoading(true)

    try {
      const data = await file.arrayBuffer()
      const workbook = xlsx.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      // Expected format: [{"NISN": "123", "Nama Lengkap": "Budi"}]
      const json = xlsx.utils.sheet_to_json(worksheet) as Array<Record<string, string>>

      const studentsToInsert = json.map((row) => ({
        nisn: row["NISN"] ? String(row["NISN"]) : null,
        full_name: row["Nama Lengkap"] || row["Nama"] || row["Name"] || "Tanpa Nama",
      }))

      if (studentsToInsert.length === 0) {
        throw new Error("File kosong atau format kolom tidak sesuai (butuh kolom 'NISN' dan 'Nama Lengkap').")
      }

      // Upsert or insert logic
      // In this basic version we will insert and ignore conflicts if NISN exists, 
      // but supabase `.insert` might throw if NISN violates unique constraint.
      // So we will just try to insert one by one or in bulk and handle errors safely.

      const { error } = await supabase
        .from('students')
        .insert(studentsToInsert)

      if (error) {
        // If there's a unique constraint error
        if (error.code === '23505') {
          throw new Error("Beberapa NISN dalam file sudah terdaftar di sistem.")
        }
        throw new Error(error.message)
      }

      toast.success("Berhasil", { description: `${studentsToInsert.length} siswa berhasil diimpor.` })
      setOpen(false)
      setFile(null)
      router.refresh()
    } catch (err: any) {
      toast.error("Gagal impor data", { description: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadTemplate = () => {
    const ws = xlsx.utils.json_to_sheet([
      { "NISN": "1234567890", "Nama Lengkap": "Budi Santoso" },
      { "NISN": "0987654321", "Nama Lengkap": "Siti Aminah" }
    ])
    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, ws, "Template Siswa")
    xlsx.writeFile(wb, "Template_Data_Siswa.xlsx")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" className="rounded-xl flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-6 h-11" />}
      >
        <FileDown size={18} />
        Import .xlsx
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="font-heading text-xl">Import Data Siswa</DialogTitle>
          <DialogDescription className="text-slate-500 pt-1">
            Unggah file Excel (.xlsx) untuk menambahkan data siswa secara massal. Pastikan file Anda memiliki kolom <strong>NISN</strong> dan <strong>Nama Lengkap</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-slate-400" />
                <p className="mb-2 text-sm text-slate-500">
                  <span className="font-semibold">Klik untuk unggah</span> atau seret file
                </p>
                <p className="text-xs text-slate-400">Hanya format .XLSX, .XLS</p>
                {file && (
                  <p className="mt-4 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {file.name}
                  </p>
                )}
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </label>
          </div>

          <div className="flex justify-between pt-4 items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDownloadTemplate}
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium px-4 h-11 rounded-xl"
            >
              Unduh Template
            </Button>
            <Button onClick={handleImport} disabled={isLoading || !file} className="rounded-xl px-8 h-11">
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Mulai Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
