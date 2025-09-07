import { Navbar } from "@/components/navbar"
import { AuthForm } from "@/components/auth-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <AuthForm />
      </div>
    </div>
  )
}
