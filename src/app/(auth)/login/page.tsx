import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="p-8 bg-card rounded-3xl shadow-lg border border-border w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shadow-md bg-white border border-slate-100 flex items-center justify-center">
            <img src="/logo.png" alt="KinderX Logo" className="w-full h-full object-cover" />
          </div>
        </div>
        <h1 className="text-2xl font-bold font-heading text-center mb-2">Masuk ke KinderX</h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          Silakan masuk menggunakan akun Anda untuk melanjutkan.
        </p>
        
        <LoginForm />
      </div>
    </div>
  )
}
