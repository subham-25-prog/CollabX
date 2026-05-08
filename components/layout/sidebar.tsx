"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/components/auth/auth-provider"
import { Home, Users, MessageCircle, User, Settings, LogOut, Sparkles, ShieldCheck, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

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
            whileHover={{ scale: 1.02, backgroundColor: "rgba(var(--secondary), 0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/20 border border-border/50 transition-all duration-300 mb-6 group"
          >
            <div className="relative">
              <img
                src={getAvatarImage()}
                alt={profile?.name || "Your profile"}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/10 bg-background group-hover:ring-primary/30 transition-all"
              />
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate text-sm leading-tight group-hover:text-primary transition-colors">{profile?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate font-medium">@{profile?.name ? profile.name.toLowerCase().replace(/\s/g, '') : "user"}</p>
            </div>
          </motion.div>
        </Link>

        {/* Main navigation */}
        <nav className="space-y-1 relative">
          {[
            { icon: Home, label: "Home Feed", href: "/feed" },
            { icon: Users, label: "Find Team", href: "/teams" },
            { icon: MessageCircle, label: "Messages", href: "/chat", badge: notifications.filter(n => !n.read && n.type === 'message').length > 0 ? true : undefined },
            { icon: User, label: "Profile", href: "/profile" },
            ...(profile?.role === 'Admin' ? [{ icon: ShieldCheck, label: "Admin", href: "/admin/notifications" }] : [])
          ].map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="block relative group">
                <motion.div
                  whileHover={{ x: 4, backgroundColor: "rgba(var(--secondary), 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-300 group-hover:scale-110 relative z-10",
                    isActive && "text-primary"
                  )} />
                  <span className="font-medium relative z-10">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)] relative z-10 animate-pulse" />
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
