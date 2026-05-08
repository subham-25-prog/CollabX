"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Loader2 } from "lucide-react"
import { checkIsAdmin } from "@/lib/admin"

export default function AdminPage() {
  const { profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (checkIsAdmin(profile)) {
        router.replace("/admin/notifications")
      } else {
        router.replace("/feed")
      }
    }
  }, [profile, isLoading, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}
