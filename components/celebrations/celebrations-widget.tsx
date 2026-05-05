"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Cake, Trophy, PartyPopper, Sparkles, ChevronLeft, ChevronRight, Plus, Heart } from "lucide-react"
import { CreateCelebrationModal } from "./create-celebration-modal"
import { toggleLikeCelebration } from "@/lib/db"
import { useAuth } from "@/components/auth/auth-provider"

const THEME_MAP: any = {
  birthday: { icon: Cake, color: 'text-pink-500', bg: 'bg-pink-500/10', label: 'Birthday' },
  achievement: { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Achievement' },
  celebration: { icon: PartyPopper, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Celebration' },
  shoutout: { icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Shoutout' },
}

export function CelebrationsWidget() {
  const { profile } = useAuth()
  const [celebrations, setCelebrations] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, "celebrations"),
      orderBy("timestamp", "desc"),
      limit(5)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setCelebrations(data)
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

  if (isLoading) return null

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          The Billboard
        </h3>
        <button 
          onClick={() => setShowModal(true)}
          className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          title="Post a wish"
        >
          <Plus className="w-4 h-4" />
        </button>
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
                  alt="Celebration" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Theme Badge */}
                <div className="absolute top-3 left-3">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-black/40 border border-white/10 shadow-lg`}>
                    {React.createElement(THEME_MAP[celebrations[currentIndex].type]?.icon || Sparkles, {
                      className: `w-3.5 h-3.5 ${THEME_MAP[celebrations[currentIndex].type]?.color || 'text-primary'}`
                    })}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                      {THEME_MAP[celebrations[currentIndex].type]?.label || 'Celebration'}
                    </span>
                  </div>
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
                <Cake className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No wishes yet</p>
                <p className="text-xs text-muted-foreground mt-1">Be the first to celebrate someone!</p>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="text-xs font-bold text-primary hover:underline"
              >
                + Post a wish
              </button>
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
    </div>
  )
}
