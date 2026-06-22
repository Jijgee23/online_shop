"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/auth_context"
import { UserRole } from "@/generated/prisma"
import { AuthShell } from "../components/AuthShell"
import { LoginForm } from "../components/LoginForm"

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      if (user.role === UserRole.ADMIN) {
        router.push("/admin")
      } else {
        router.push("/")
      }
    }
  }, [user, router])

  return (
    <AuthShell title="Нэвтрэх">
      <LoginForm />
    </AuthShell>
  )
}
