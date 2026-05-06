"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Users, Plus, MessageCircle, User, MessageSquarePlus, MessageSquareQuote } from "lucide-react"
import { useState } from "react"
import { CreatePostModal } from "@/components/feed/create-post-modal"
import { FeedbackModal } from "@/components/feedback/feedback-modal"
import { useAuth } from "@/components/auth/auth-provider"
import { checkIsAdmin } from "@/lib/admin"

const getNavItems = (unreadMessages: number) => [
  { icon: Home, label: "Feed", href: "/feed" },
  { icon: Users, label: "Teams", href: "/teams" },
  { icon: Plus, label: "Post", href: "#", isAction: true },
  { icon: MessageCircle, label: "Chat", href: "/chat", badge: unreadMessages > 0 ? unreadMessages : null },
  { icon: User, label: "Profile", href: "/profile" },
]

import { useNotifications } from "@/hooks/use-notifications"

export function MobileNav() {
  const pathname = usePathname()
  const { profile } = useAuth()
  const { notifications } = useNotifications()
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  
  const isAdmin = checkIsAdmin(profile)
  const unreadMessages = notifications.filter(n => !n.read && n.type === 'message').length
  const navItems = getNavItems(unreadMessages)

  return (
    <>
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          if (item.isAction) {
            return (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCreatePost(true)}
                className="flex items-center justify-center w-12 h-12 rounded-full gradient-primary shadow-lg shadow-primary/30"
              >
                <item.icon className="w-6 h-6 text-primary-foreground" />
              </motion.button>
            )
          }

          return (
            <Link key={item.href} href={item.href} className="relative">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] border border-background" />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </div>

      <AnimatePresence>
        {showCreatePost && (
          <CreatePostModal onClose={() => setShowCreatePost(false)} />
        )}
      </AnimatePresence>
    </nav>

    {/* Floating Feedback Button - Only in Feed */}
    {(pathname === '/feed' || pathname === '/') && (
      <div className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-40 flex flex-col gap-3">
        {isAdmin ? (
          <Link href="/admin/feedback">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full glass-strong border border-primary/20 flex items-center justify-center text-primary shadow-lg"
            >
              <MessageSquareQuote className="w-6 h-6" />
            </motion.div>
          </Link>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFeedback(true)}
            className="w-12 h-12 rounded-full glass-strong border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg"
          >
            <MessageSquarePlus className="w-6 h-6" />
          </motion.button>
        )}
      </div>
    )}

    <AnimatePresence>
      {showFeedback && (
        <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}
    </AnimatePresence>
    </>
  )
}
