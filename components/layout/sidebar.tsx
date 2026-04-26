"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Users, MessageCircle, User, Settings, LogOut, Sparkles } from "lucide-react"

const navItems = [
  { icon: Home, label: "Home Feed", href: "/feed" },
  { icon: Users, label: "Find Team", href: "/teams" },
  { icon: MessageCircle, label: "Messages", href: "/chat", badge: 3 },
  { icon: User, label: "Profile", href: "/profile" },
]

const bottomItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: LogOut, label: "Sign Out", href: "/auth" },
]

export function Sidebar() {
  const pathname = usePathname()

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
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                alt="Your profile"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">Tom Wilson</p>
              <p className="text-sm text-muted-foreground truncate">@tomwilson</p>
            </div>
          </motion.div>
        </Link>

        {/* Main navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
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
                    <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Upgrade card */}
        <div className="mt-6 p-4 rounded-2xl gradient-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
              <span className="font-semibold text-primary-foreground">Go Pro</span>
            </div>
            <p className="text-sm text-primary-foreground/80 mb-3">
              Unlock advanced team matching and analytics
            </p>
            <button className="w-full py-2 px-4 rounded-lg bg-white/20 hover:bg-white/30 text-primary-foreground text-sm font-medium transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="p-4 border-t border-border space-y-1">
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </aside>
  )
}
