"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bell, Info, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { auth } from "@/lib/firebase"
import { checkIsAdmin } from "@/lib/admin"

export default function AdminNotificationsPage() {
  const { profile, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!isAuthLoading) {
      if (!profile || !checkIsAdmin(profile)) {
        router.replace("/feed")
      }
    }
  }, [profile, isAuthLoading, router])

  const handleSendBlast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !message) {
      toast.error("Please fill in both title and message")
      return
    }

    if (!confirm("Are you sure you want to send this notification to EVERY user on the platform?")) {
      return
    }

    setIsSending(true)
    setStatus('idle')

    try {
      const idToken = await auth.currentUser?.getIdToken()
      
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          title,
          body: message,
          sendToAll: true,
          data: {
            url: "/feed",
            type: "admin_blast"
          }
        })
      })

      const result = await response.json()
      if (result.success) {
        setStatus('success')
        toast.success("Blast sent successfully to " + result.successCount + " users!")
        setTitle("")
        setMessage("")
      } else {
        throw new Error(result.error || "Failed to send")
      }
    } catch (error: any) {
      console.error("Admin blast error:", error)
      setStatus('error')
      toast.error(error.message || "Failed to send notification blast")
    } finally {
      setIsSending(false)
    }
  }

  if (isAuthLoading || !profile || !checkIsAdmin(profile)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pt-24 pb-12">
          <div className="max-w-3xl mx-auto px-4">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Admin Panel</h1>
              </div>
              <p className="text-muted-foreground">Manage global announcements and advertisements.</p>
            </div>

            <div className="grid gap-8">
              {/* Notification Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-strong rounded-3xl p-8 border border-border/50 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <Bell className="w-32 h-32 text-primary" />
                </div>

                <div className="relative z-10">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" />
                    Global Notification Blast
                  </h2>

                  <form onSubmit={handleSendBlast} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium ml-1">Notification Title</label>
                      <input
                        type="text"
                        placeholder="e.g. New Feature Launch! 🚀"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-primary/50 outline-none transition-all text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium ml-1">Message Body</label>
                      <textarea
                        placeholder="e.g. Check out the new personalized feed and dark mode..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full px-5 py-4 rounded-2xl bg-secondary/50 border border-border focus:border-primary/50 outline-none transition-all resize-none text-lg"
                      />
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3">
                      <Info className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-500/90 leading-relaxed">
                        <strong>Warning:</strong> This will send a real-time push notification to <strong>ALL</strong> students who have enabled notifications. Use this sparingly for advertisements or important updates.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSending || !title || !message}
                      className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Sending Blast...
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6" />
                          Send Blast to Everyone
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>

              {/* Status Indicator */}
              <AnimatePresence>
                {status !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-6 rounded-2xl flex items-center gap-4 border ${
                      status === 'success' 
                        ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}
                  >
                    {status === 'success' ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <AlertCircle className="w-8 h-8" />
                    )}
                    <div>
                      <p className="font-bold">
                        {status === 'success' ? 'Mission Accomplished!' : 'Blast Failed'}
                      </p>
                      <p className="text-sm opacity-90">
                        {status === 'success' 
                          ? 'Your advertisement has been broadcasted to the entire CollabX network.' 
                          : 'There was an error connecting to the notification service.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
