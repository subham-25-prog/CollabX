"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, Bell, Plus, X } from "lucide-react"

interface NavbarProps {
  onCreatePost?: () => void
}

export function Navbar({ onCreatePost }: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">CollabX</span>
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search people, teams, posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-transparent focus:border-primary/30 focus:bg-secondary transition-all duration-200 outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile search toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              {isSearchOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Search className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl hover:bg-secondary/50 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>

            {/* Create post button - Desktop */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreatePost}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              Post
            </motion.button>

            {/* Profile avatar */}
            <Link href="/profile">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary/50 transition-all cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                  alt="Your profile"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search people, teams, posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-primary/30 transition-all duration-200 outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}
