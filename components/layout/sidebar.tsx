"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/components/auth/auth-provider"
import { Home, Users, MessageCircle, User, Settings, LogOut, Sparkles, ShieldCheck, MessageSquare } from "lucide-react"

import { useNotifications } from "@/hooks/use-notifications"
import { InstallPWAButton } from "@/components/pwa/install-button"
import { FeedbackModal } from "@/components/feedback/feedback-modal"
import { useState } from "react"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"

const navItems: { icon: any; label: string; href: string; badge?: number }[] = [
  { icon: Home, label: "Home Feed", href: "/feed" },
  { icon: Users, label: "Find Team", href: "/teams" },
  { icon: MessageCircle, label: "Messages", href: "/chat" },
  { icon: User, label: "Profile", href: "/profile" },
]

const bottomItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: LogOut, label: "Sign Out", href: "/auth" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile } = useAuth()
  const { unreadCount, notifications } = useNotifications()
  const [showFeedback, setShowFeedback] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/auth")
    } catch (error) {
      console.error("Failed to sign out:", error)
    }
  }

  const getAvatarImage = () => {
    const p = profile as any;
    if (p?.avatar) return p.avatar;
    if (p?.gender === 'Female') return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop";
    if (p?.gender === 'Male') return "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop";
    return `https://api.dicebear.com/7.x/initials/svg?seed=${p?.name || "fallback"}`;
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 flex-col glass-strong border-r border-border z-40">
      <div className="flex-1 py-6 px-4 space-y-2">
        {/* Profile card */}
        <Link href="/profile">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-all duration-200 mb-6"
          >
            <div className="relative">
              <img
                src={getAvatarImage()}
                alt={profile?.name || "Your profile"}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 bg-background"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{profile?.name || "User"}</p>
              <p className="text-sm text-muted-foreground truncate">@{profile?.name ? profile.name.toLowerCase().replace(/\s/g, '') : "user"}</p>
            </div>
          </motion.div>
        </Link>

        {/* Main navigation */}
        <nav className="space-y-1">
          {[
            { icon: Home, label: "Home Feed", href: "/feed" },
            { icon: Users, label: "Find Team", href: "/teams" },
            { icon: MessageCircle, label: "Messages", href: "/chat", badge: notifications.filter(n => !n.read && n.type === 'message').length > 0 ? true : undefined },
            { icon: User, label: "Profile", href: "/profile" },
            ...(profile?.role === 'Admin' ? [{ icon: ShieldCheck, label: "Admin", href: "/admin/notifications" }] : [])
          ].map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Upgrade card removed for student platform */}
      </div>

      {/* Bottom navigation */}
      <div className="p-4 border-t border-border space-y-1">

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200 w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
        <InstallPWAButton />
      </div>

      <AnimatePresence>
        {showFeedback && (
          <FeedbackModal onClose={() => setShowFeedback(false)} />
        )}
      </AnimatePresence>
    </aside>
  )
}
