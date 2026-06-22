"use client"

import { useRouter } from "next/navigation"
import { AuthShell } from "../components/AuthShell"
import { RegisterForm } from "../components/RegisterForm"

export default function RegisterPage() {
  const router = useRouter()

  return (
    <AuthShell title="Бүртгүүлэх">
      <RegisterForm onSuccess={() => router.push("/auth/login")} />
    </AuthShell>
  )
}
