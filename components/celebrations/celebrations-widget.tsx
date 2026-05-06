"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Cake, Trophy, PartyPopper, Sparkles, ChevronLeft, ChevronRight, Plus, Heart, Trash2, X, Megaphone, Zap, BadgePercent } from "lucide-react"
import { CreateCelebrationModal } from "./create-celebration-modal"
import { toggleLikeCelebration, deleteCelebration } from "@/lib/db"
import { useAuth } from "@/components/auth/auth-provider"

const THEME_MAP: any = {
  announcement: { icon: Megaphone, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Announcement' },
  promotion: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Promotion' },
  advertisement: { icon: BadgePercent, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Sponsored' },
  celebration: { icon: PartyPopper, color: 'text-pink-500', bg: 'bg-pink-500/10', label: 'Celebration' },
}

export function CelebrationsWidget() {
  const { profile } = useAuth()
  const [celebrations, setCelebrations] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedCelebration, setExpandedCelebration] = useState<any>(null)

  useEffect(() => {
    const q = query(
      collection(db, "celebrations"),
      orderBy("timestamp", "desc"),
      limit(5)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setCelebrations(data)
      setCurrentIndex(prev => data.length === 0 ? 0 : Math.min(prev, data.length - 1))
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const next = () => setCurrentIndex((prev) => (prev + 1) % celebrations.length)
  const prev = () => setCurrentIndex((prev) => (prev - 1 + celebrations.length) % celebrations.length)

  // Auto-slide
  useEffect(() => {
    if (celebrations.length <= 1) return
    const timer = setInterval(next, 8000)
    return () => clearInterval(timer)
  }, [celebrations.length])

  const handleLike = async (id: string, isLiked: boolean) => {
    if (!profile) return
    try {
      await toggleLikeCelebration(id, profile.uid, isLiked)
    } catch (error) {
      console.error("Failed to like celebration", error)
    }
  }

  const isAdmin = profile?.role === 'admin' || profile?.email === 'shubhamoy27@gmail.com'

  const handleDelete = async (id: string) => {
    // Check if user is admin or the author
    const currentCelebration = celebrations.find(c => c.id === id)
    if (!profile || !isAdmin) return

    if (confirm("Are you sure you want to delete this post from the billboard?")) {
      try {
        await deleteCelebration(id)
      } catch (error) {
        console.error("Failed to delete", error)
      }
    }
  }

  if (isLoading) return null

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          The Billboard
        </h3>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            title="Create Post"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative group">
        <AnimatePresence mode="wait">
          {celebrations.length > 0 ? (
            <motion.div
              key={celebrations[currentIndex].id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass overflow-hidden rounded-2xl border border-white/10 shadow-lg"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img 
                  src={celebrations[currentIndex].imageUrl} 
                  alt="Billboard Post" 
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setExpandedCelebration(celebrations[currentIndex])}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                
                {/* Theme Badge and Controls */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-black/40 border border-white/10 shadow-lg pointer-events-auto`}>
                    {React.createElement(THEME_MAP[celebrations[currentIndex].type]?.icon || Sparkles, {
                      className: `w-3.5 h-3.5 ${THEME_MAP[celebrations[currentIndex].type]?.color || 'text-primary'}`
                    })}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                      {THEME_MAP[celebrations[currentIndex].type]?.label || 'Billboard Post'}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(celebrations[currentIndex].id)
                      }}
                      className="p-2 rounded-full bg-black/40 text-red-500 hover:bg-red-500 hover:text-white transition-colors backdrop-blur-md border border-white/10 pointer-events-auto"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                  <p className="text-sm text-white/90 font-medium leading-relaxed line-clamp-3 italic">
                    "{celebrations[currentIndex].content}"
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={celebrations[currentIndex].author.avatar} 
                        className="w-6 h-6 rounded-full border border-white/20" 
                        alt=""
                      />
                      <span className="text-[10px] text-white/60 font-medium">
                        By {celebrations[currentIndex].author.name}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleLike(celebrations[currentIndex].id, celebrations[currentIndex].likes?.includes(profile?.uid))}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md transition-all ${
                        celebrations[currentIndex].likes?.includes(profile?.uid) 
                          ? 'bg-pink-500/20 text-pink-500' 
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${celebrations[currentIndex].likes?.includes(profile?.uid) ? 'fill-current' : ''}`} />
                      <span className="text-[10px] font-bold">{celebrations[currentIndex].likes?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center space-y-3 border border-dashed border-white/10">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto opacity-50">
                <Megaphone className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No posts yet</p>
                <p className="text-xs text-muted-foreground mt-1">Stay tuned for updates and announcements!</p>
              </div>
              {isAdmin && (
                <button 
                  onClick={() => setShowModal(true)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  + Create Post
                </button>
              )}
            </div>
          )}
        </AnimatePresence>

        {celebrations.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={prev} className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/10">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/10">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <CreateCelebrationModal onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expandedCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setExpandedCelebration(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row bg-background rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button
                onClick={() => setExpandedCelebration(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex-1 bg-black min-h-[40vh] md:min-h-[auto] flex items-center justify-center relative">
                <img 
                  src={expandedCelebration.imageUrl} 
                  alt="Billboard Post" 
                  className="max-w-full max-h-[60vh] md:max-h-[90vh] object-contain"
                />
              </div>
              
              <div className="w-full md:w-96 p-6 flex flex-col gap-6 bg-card border-l border-white/5">
                <div className="flex items-center gap-3">
                  <img 
                    src={expandedCelebration.author.avatar} 
                    alt="" 
                    className="w-10 h-10 rounded-full border border-primary/20"
                  />
                  <div>
                    <p className="font-semibold text-sm">{expandedCelebration.author.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{THEME_MAP[expandedCelebration.type]?.label || 'Billboard Post'}</p>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <p className="text-sm md:text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {expandedCelebration.content}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <button 
                    onClick={() => {
                      handleLike(expandedCelebration.id, expandedCelebration.likes?.includes(profile?.uid))
                      setExpandedCelebration({
                        ...expandedCelebration,
                        likes: expandedCelebration.likes?.includes(profile?.uid)
                          ? expandedCelebration.likes.filter((id: string) => id !== profile?.uid)
                          : [...(expandedCelebration.likes || []), profile?.uid]
                      })
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all w-full justify-center ${
                      expandedCelebration.likes?.includes(profile?.uid) 
                        ? 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20' 
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${expandedCelebration.likes?.includes(profile?.uid) ? 'fill-current' : ''}`} />
                    <span className="font-semibold">{expandedCelebration.likes?.length || 0} Likes</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
