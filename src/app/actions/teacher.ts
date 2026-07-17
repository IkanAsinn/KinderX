"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createTeacherSchema = z.object({
  full_name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  photo_url: z.string().optional(),
})

export async function createTeacherAction(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    const parsed = createTeacherSchema.safeParse(data)
    
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const { full_name, email, password, photo_url } = parsed.data
    const supabaseAdmin = createAdminClient()

    // 1. Create the user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'teacher' }
    })

    if (authError) {
      console.error("Auth creation error:", authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: "Gagal membuat akun autentikasi." }
    }

    // 2. Insert into public.users table
    // (Bypasses RLS because it's the admin client)
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        role: 'teacher',
        full_name: full_name,
        email: email,
        photo_url: photo_url || null,
      })

    if (dbError) {
      console.error("Database insertion error:", dbError)
      // Cleanup the auth user if DB insert fails to maintain consistency
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: "Gagal menyimpan data profil guru." }
    }

    revalidatePath("/admin/teachers")
    return { success: true }
    
  } catch (error) {
    console.error("Unexpected error in createTeacherAction:", error)
    return { success: false, error: "Terjadi kesalahan server yang tidak terduga." }
  }
}
