"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Plus, Eye, EyeOff, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { createTeacherAction } from "@/app/actions/teacher"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { ImageCropper } from "@/components/image-cropper"

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

const formSchema = z.object({
  full_name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

export function AddTeacherDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [cropperSrc, setCropperSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const router = useRouter()

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    let profilePictureUrl = ""

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

    // We use FormData so it fits cleanly into standard Server Actions
    const formData = new FormData()
    formData.append("full_name", values.full_name)
    formData.append("email", values.email)
    formData.append("password", values.password)
    if (profilePictureUrl) {
      formData.append("photo_url", profilePictureUrl)
    }

    const result = await createTeacherAction(formData)

    if (!result.success) {
      toast.error("Gagal Menambahkan Guru", { description: result.error })
      setIsLoading(false)
      return
    }

    toast.success("Berhasil", { description: "Akun guru baru telah dibuat." })
    setOpen(false)
    setPhotoFile(null)
    setPhotoPreview(null)
    form.reset()
    router.refresh()
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="rounded-xl h-11 px-6 shadow-md shadow-primary/20 hover:shadow-lg transition-all font-semibold">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Guru
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto rounded-3xl p-6 bg-white border-none shadow-2xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="font-heading text-xl">Tambah Guru Baru</DialogTitle>
          <DialogDescription className="text-slate-500 pt-1">
            Buat kredensial login untuk guru baru di sistem.
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
                  disabled={isLoading}
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
                    <Input placeholder="Budi Santoso" {...field} disabled={isLoading} className="rounded-xl h-11 px-4" />
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
                  <FormLabel className="text-slate-700 font-semibold">Alamat Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="budi@kinderx.id" {...field} disabled={isLoading} className="rounded-xl h-11 px-4" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Password Sementara</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Minimal 6 karakter" 
                        {...field} 
                        disabled={isLoading} 
                        className="rounded-xl h-11 pl-4 pr-10" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full rounded-xl h-11 font-semibold shadow-md shadow-primary/20 mt-4">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Buat Akun Guru"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
