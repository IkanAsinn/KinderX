"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Trash2, Upload, X, User } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ImageCropper } from "@/components/image-cropper"

const formSchema = z.object({
  full_name: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid").or(z.literal("")),
})

type Teacher = {
  id: string
  full_name: string
  email: string | null
  photo_url: string | null
  created_at: string
}

export function TeacherDetailDialog({ teacher }: { teacher: Teacher }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(teacher.photo_url)
  const [cropperSrc, setCropperSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: teacher.full_name,
      email: teacher.email || "",
    },
  })

  // Reset form when dialog opens with current values
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      form.reset({
        full_name: teacher.full_name,
        email: teacher.email || "",
      })
      setPhotoPreview(teacher.photo_url)
      setPhotoFile(null)
    }
    setOpen(newOpen)
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File terlalu besar", { description: "Ukuran foto maksimal 5MB." })
        return
      }
      setCropperSrc(URL.createObjectURL(file))
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleCropComplete = (croppedFile: File) => {
    setPhotoFile(croppedFile)
    setPhotoPreview(URL.createObjectURL(croppedFile))
    setCropperSrc(null)
  }

  const handleCropCancel = () => {
    setCropperSrc(null)
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    let profilePictureUrl = teacher.photo_url

    // If photo was removed
    if (!photoPreview && profilePictureUrl) {
      profilePictureUrl = null
    }

    // If new photo was added
    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, photoFile)

      if (uploadError) {
        toast.error("Gagal Mengunggah", { description: "Terjadi kesalahan saat mengunggah foto profil." })
        setIsLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
        
      profilePictureUrl = publicUrl
    }

    const { error } = await supabase
      .from('users')
      .update({
        full_name: values.full_name,
        email: values.email || null,
        photo_url: profilePictureUrl,
      })
      .eq('id', teacher.id)

    if (error) {
      toast.error("Gagal Memperbarui", { description: error.message })
      setIsLoading(false)
      return
    }

    toast.success("Berhasil", { description: "Data guru telah diperbarui." })
    setOpen(false)
    router.refresh()
    setIsLoading(false)
  }

  async function handleDelete() {
    if (!confirm("Apakah Anda yakin ingin menghapus data guru ini? Data tidak dapat dikembalikan.")) return
    
    setIsDeleting(true)
    
    // Note: Deleting from public.users will trigger cascade deletes if set up,
    // but the actual auth user must be deleted via Admin API if we want them fully gone.
    // However, since we don't have Admin API access securely on the client, 
    // deleting their public.users profile will effectively orphan them and they lose the 'teacher' role.
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', teacher.id)

    if (error) {
      toast.error("Gagal Menghapus", { description: error.message })
      setIsDeleting(false)
      return
    }

    toast.success("Berhasil", { description: "Data guru telah dihapus." })
    setOpen(false)
    router.refresh()
    setIsDeleting(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button type="button" className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full cursor-pointer hover:bg-indigo-100 transition-colors">
            Lihat Detail
          </button>
        }
      />
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-8">
        <DialogHeader className="mb-2">
          <DialogTitle className="font-heading text-xl">Profil Guru</DialogTitle>
          <DialogDescription className="text-slate-500 pt-1">
            Lihat dan perbarui data profil guru.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            
            {cropperSrc && (
              <ImageCropper 
                imageSrc={cropperSrc} 
                onCropComplete={handleCropComplete} 
                onCancel={handleCropCancel} 
              />
            )}

            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div 
                  className={cn(
                    "w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors cursor-pointer bg-slate-50",
                    photoPreview ? "border-transparent" : "border-slate-300 hover:border-primary hover:bg-primary/5"
                  )}
                  onClick={() => !photoPreview && fileInputRef.current?.click()}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-primary transition-colors">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-semibold">FOTO</span>
                    </div>
                  )}
                </div>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg, image/png, image/webp" 
                  onChange={handlePhotoSelect}
                  disabled={isLoading || isDeleting}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Budi Santoso" {...field} disabled={isLoading || isDeleting} className="rounded-xl h-11 px-4" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contoh: guru@kinderx.id" {...field} disabled={isLoading || isDeleting} className="rounded-xl h-11 px-4" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDelete}
                disabled={isLoading || isDeleting}
                className="rounded-xl px-4 h-11 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                {isDeleting ? "" : "Hapus"}
              </Button>
              <Button type="submit" disabled={isLoading || isDeleting} className="rounded-xl px-8 h-11">
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
