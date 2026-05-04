"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bell, Plus, X, MessageSquare, Heart, Users, CheckCircle, XCircle, Info, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useNotifications, Notification } from "@/hooks/use-notifications"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { markNotificationRead } from "@/lib/db"
import { useRouter, usePathname } from "next/navigation"
import { collection, query, getDocs, limit, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { LogoIcon } from "@/components/ui/logo"

interface NavbarProps {
  onCreatePost?: () => void
}

export function Navbar({ onCreatePost }: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{users: any[], posts: any[]}>({users: [], posts: []})
  const [showDropdown, setShowDropdown] = useState(false)

  const { profile } = useAuth()
  const { notifications, unreadCount } = useNotifications()
  const router = useRouter()
  const pathname = usePathname()
  const searchRef = useRef<HTMLDivElement>(null)

  const isFeedPage = pathname === '/feed' || pathname === '/'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({users: [], posts: []})
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      setShowDropdown(true)
      
      try {
        const queryText = searchQuery.toLowerCase()
        
        // Fetch users
        const usersSnap = await getDocs(query(collection(db, "users")))
        const allUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }))
        const matchedUsers = allUsers.filter(u => 
          u.name?.toLowerCase().includes(queryText) || 
          u.role?.toLowerCase().includes(queryText)
        ).slice(0, 5)

        // Fetch posts
        const postsSnap = await getDocs(query(collection(db, "posts"), orderBy("timestamp", "desc"), limit(50)))
        const allPosts = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }))
        const matchedPosts = allPosts.filter(p => 
          p.content?.toLowerCase().includes(queryText)
        ).slice(0, 5)

        setSearchResults({
          users: matchedUsers,
          posts: matchedPosts
        })
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read && profile?.uid) {
      await markNotificationRead(profile.uid, notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'like': return <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
      case 'comment': return <MessageSquare className="w-4 h-4 text-green-500" />
      case 'follow': return <Users className="w-4 h-4 text-purple-500" />
      case 'application_accepted': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'application_rejected': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Info className="w-4 h-4 text-primary" />
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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-3 group">
            <LogoIcon className="group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xl font-bold gradient-text hidden sm:block">CollabX</span>
          </Link>

          {/* Search bar - Desktop */}
          {isFeedPage && (
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
              <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search people or posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if(searchQuery) setShowDropdown(true) }}
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-secondary/50 border border-transparent focus:border-primary/30 focus:bg-secondary transition-all duration-200 outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>

            {/* Search Dropdown */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-full glass border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[400px]"
                >
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : searchResults.users.length === 0 && searchResults.posts.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="overflow-y-auto custom-scrollbar p-2">
                      {searchResults.users.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Students</h4>
                          <div className="space-y-1">
                            {searchResults.users.map(user => (
                              <Link 
                                key={user.id} 
                                href={`/profile?id=${user.id}`}
                                onClick={() => setShowDropdown(false)}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/80 transition-colors"
                              >
                                <Image width={32} height={32} unoptimized src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} className="w-8 h-8 rounded-full bg-secondary object-cover" />
                                <div>
                                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.role}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.posts.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Posts</h4>
                          <div className="space-y-1">
                            {searchResults.posts.map(post => (
                              <button 
                                key={post.id} 
                                onClick={() => {
                                  setShowDropdown(false);
                                  router.push(`/feed?post=${post.id}`)
                                }}
                                className="w-full text-left flex flex-col gap-1 p-3 rounded-xl hover:bg-secondary/80 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Image width={20} height={20} unoptimized src={post.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.name}`} alt="" className="w-5 h-5 rounded-full" />
                                  <span className="text-xs font-medium text-foreground">{post.author?.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile search toggle */}
            {isFeedPage && (
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
            )}

            {/* Notifications */}
            <Link href="/notifications" className="relative p-2.5 rounded-xl hover:bg-secondary/50 transition-colors outline-none block">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 bg-accent rounded-full text-[10px] font-bold text-accent-foreground border-2 border-background">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Create post button - Desktop */}
            {onCreatePost && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCreatePost}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                Post
              </motion.button>
            )}

            {/* Profile avatar */}
            <Link href="/profile">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary/50 transition-all cursor-pointer"
              >
                <Image
                  src={getAvatarImage()}
                  alt={profile?.name || "Your profile"}
                  width={36}
                  height={36}
                  unoptimized
                  className="w-full h-full object-cover bg-background"
                />
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        <AnimatePresence>
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
                  placeholder="Search people or posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-primary/30 transition-all duration-200 outline-none text-sm placeholder:text-muted-foreground"
                />
              </div>
              
              {/* Mobile Dropdown Results inline */}
              {searchQuery.length > 0 && (
                <div className="mt-2 w-full glass border border-border rounded-xl shadow-lg p-2 max-h-[60vh] overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : searchResults.users.length === 0 && searchResults.posts.length === 0 ? (
                      <div className="py-4 text-center text-muted-foreground text-sm">
                        No results found
                      </div>
                    ) : (
                      <>
                        {searchResults.users.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Students</h4>
                            <div className="space-y-1">
                              {searchResults.users.map(user => (
                                <Link 
                                  key={user.id} 
                                  href={`/profile?id=${user.id}`}
                                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/80 transition-colors"
                                >
                                  <Image width={32} height={32} unoptimized src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt="" className="w-8 h-8 rounded-full bg-secondary object-cover" />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        {searchResults.posts.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Posts</h4>
                            <div className="space-y-1">
                              {searchResults.posts.map(post => (
                                <button 
                                  key={post.id} 
                                  onClick={() => {
                                    setIsSearchOpen(false); 
                                    setSearchQuery('');
                                    router.push(`/feed?post=${post.id}`)
                                  }}
                                  className="w-full text-left flex flex-col gap-1 p-2 rounded-lg hover:bg-secondary/80 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <Link 
                                      href={`/profile?id=${post.author?.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsSearchOpen(false);
                                        setSearchQuery('');
                                      }}
                                    >
                                      <Image width={24} height={24} unoptimized src={post.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.name}`} alt="" className="w-6 h-6 rounded-full hover:ring-2 hover:ring-primary/50 transition-all" />
                                    </Link>
                                    <span className="text-xs font-medium text-foreground">{post.author?.name}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
