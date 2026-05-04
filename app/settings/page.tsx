"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { useAuth } from "@/components/auth/auth-provider"
import { Bell, Shield, Key, Moon, Sun, Monitor, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { profile, isLoading } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("account")

  useEffect(() => {
    if (!isLoading && !profile) {
      router.push("/auth")
    }
  }, [profile, isLoading, router])

  const handleSignOut = async () => {
    await signOut(auth)
    router.push("/auth")
  }

  if (isLoading) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20 lg:pb-8 max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your account preferences and settings.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar-like tabs for settings (desktop only) */}
            <div className="hidden md:flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab("account")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-left transition-colors ${activeTab === "account" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                <Shield className="w-5 h-5" /> Account
              </button>
              <button 
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-left transition-colors ${activeTab === "notifications" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                <Bell className="w-5 h-5" /> Notifications
              </button>
              <button 
                onClick={() => setActiveTab("privacy")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-left transition-colors ${activeTab === "privacy" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50"}`}
              >
                <Key className="w-5 h-5" /> Privacy
              </button>
            </div>

            {/* Content area */}
            <div className="md:col-span-2 space-y-6">
              {activeTab === "account" && (
                <>
                  <div className="glass rounded-2xl p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-foreground border-b border-border pb-4">Theme Preferences</h2>
                    <div className="grid grid-cols-3 gap-4">
                      <button 
                        onClick={() => setTheme("light")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      >
                        <Sun className="w-6 h-6 text-foreground" />
                        <span className="text-sm font-medium text-foreground">Light</span>
                      </button>
                      <button 
                        onClick={() => setTheme("dark")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      >
                        <Moon className="w-6 h-6 text-foreground" />
                        <span className="text-sm font-medium text-foreground">Dark</span>
                      </button>
                      <button 
                        onClick={() => setTheme("system")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      >
                        <Monitor className="w-6 h-6 text-foreground" />
                        <span className="text-sm font-medium text-foreground">System</span>
                      </button>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-foreground border-b border-border pb-4">Account Actions</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Edit Profile</p>
                          <p className="text-sm text-muted-foreground">Update your public profile information</p>
                        </div>
                        <button onClick={() => router.push("/profile")} className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium transition-colors">
                          Go to Profile
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                          <p className="font-medium text-destructive">Sign Out</p>
                          <p className="text-sm text-muted-foreground">Log out of your account on this device</p>
                        </div>
                        <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/50 text-destructive hover:bg-destructive/10 text-sm font-medium transition-colors">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "notifications" && (
                <div className="glass rounded-2xl p-6 space-y-6">
                  <h2 className="text-xl font-semibold text-foreground border-b border-border pb-4">Notifications</h2>
                  <div className="space-y-4 text-center py-8">
                    <Bell className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Notification settings coming soon.</p>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="glass rounded-2xl p-6 space-y-6">
                  <h2 className="text-xl font-semibold text-foreground border-b border-border pb-4">Privacy & Security</h2>
                  <div className="space-y-4 text-center py-8">
                    <Key className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Privacy settings coming soon.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      <MobileNav />
    </div>
  )
}
