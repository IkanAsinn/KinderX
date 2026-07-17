"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Plus, Check, ChevronsUpDown, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DatePicker } from "@/components/ui/date-picker"
import { ImageCropper } from "@/components/image-cropper"

const formSchema = z.object({
  nisn: z.string().min(3, "NISN minimal 3 karakter").or(z.literal("")),
  full_name: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  parent_id: z.string().or(z.literal("none")),
  date_of_birth: z.string().or(z.literal("")),
  gender: z.string().or(z.literal("")),
})

type Parent = {
  id: string
  full_name: string
}

export function AddStudentDialog({ parents }: { parents: Parent[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [comboboxWidth, setComboboxWidth] = useState(0)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [cropperSrc, setCropperSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

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

  useEffect(() => {
    if (triggerRef.current && comboboxOpen) {
      setComboboxWidth(triggerRef.current.offsetWidth)
    }
  }, [comboboxOpen])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nisn: "",
      full_name: "",
      parent_id: "none",
      date_of_birth: "",
      gender: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    if (values.nisn) {
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('nisn', values.nisn)
        .single()

      if (existingStudent) {
        toast.error("Gagal", { description: "Siswa dengan NISN ini sudah terdaftar." })
        setIsLoading(false)
        return
      }
    }

    let profilePictureUrl = null

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
      .from('students')
      .insert({
        nisn: values.nisn || null,
        full_name: values.full_name,
        parent_id: values.parent_id === "none" ? null : values.parent_id,
        date_of_birth: values.date_of_birth || null,
        gender: values.gender || null,
        profile_picture: profilePictureUrl,
      })

    if (error) {
      toast.error("Gagal", { description: error.message })
      setIsLoading(false)
      return
    }

    toast.success("Berhasil", { description: "Siswa baru telah ditambahkan." })
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
        render={<Button className="rounded-xl flex items-center gap-2 px-6 h-11" />}
      >
        <Plus size={18} />
        Tambah Siswa
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-8">
        <DialogHeader className="mb-2">
          <DialogTitle className="font-heading text-xl">Tambah Siswa Baru</DialogTitle>
          <DialogDescription className="text-slate-500 pt-1">
            Tambahkan data siswa baru ke sistem.
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
              name="nisn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">NISN / ID Siswa</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 1029384756" {...field} disabled={isLoading} className="rounded-xl h-11 px-4" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Budi Santoso" {...field} disabled={isLoading} className="rounded-xl h-11 px-4" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-slate-700 font-semibold mb-1">Tanggal Lahir</FormLabel>
                    <DatePicker 
                      value={field.value} 
                      onChange={field.onChange} 
                      disabled={isLoading}
                      maxDate={new Date()}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-slate-700 font-semibold mb-1">Jenis Kelamin</FormLabel>
                    <div className="flex h-12 gap-2">
                      <button
                        type="button"
                        onClick={() => field.onChange("L")}
                        disabled={isLoading}
                        className={cn(
                          "flex-1 rounded-xl text-sm font-semibold transition-all border",
                          field.value === "L" 
                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                        )}
                      >
                        Laki-laki
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange("P")}
                        disabled={isLoading}
                        className={cn(
                          "flex-1 rounded-xl text-sm font-semibold transition-all border",
                          field.value === "P" 
                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                        )}
                      >
                        Perempuan
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

            
            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem className="flex flex-col" ref={triggerRef}>
                  <FormLabel className="text-slate-700 font-semibold mb-1">Orang Tua / Wali (Opsional)</FormLabel>
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={comboboxOpen}
                          className={cn(
                            "w-full justify-between rounded-xl h-11 px-4 font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          {field.value && field.value !== "none"
                            ? parents.find((p) => p.id === field.value)?.full_name
                            : "Pilih orang tua..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      }
                    />
                    <PopoverContent 
                      className="p-0 rounded-2xl shadow-xl" 
                      align="start"
                      style={{ width: comboboxWidth > 0 ? comboboxWidth : 'auto' }}
                    >
                      <Command>
                        <CommandInput placeholder="Cari nama orang tua..." />
                        <CommandList>
                          <CommandEmpty>Orang tua tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                form.setValue("parent_id", "none", { shouldDirty: true })
                                setComboboxOpen(false)
                              }}
                            >
                              Belum ditautkan
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  field.value === "none" ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                            {parents.map((parent) => (
                              <CommandItem
                                key={parent.id}
                                value={parent.full_name}
                                onSelect={() => {
                                  form.setValue("parent_id", parent.id, { shouldDirty: true })
                                  setComboboxOpen(false)
                                }}
                              >
                                {parent.full_name}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    parent.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
              <Button type="submit" disabled={isLoading} className="rounded-xl px-8 h-11">
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Simpan Data
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
