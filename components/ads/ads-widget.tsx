"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Plus, Trash2, Megaphone } from "lucide-react"
import { CreateAdModal } from "./create-ad-modal"
import { deleteAd } from "@/lib/db"
import { useAuth } from "@/components/auth/auth-provider"
import { checkIsAdmin } from "@/lib/admin"

export function AdsWidget() {
  const { profile } = useAuth()
  const isAdmin = checkIsAdmin(profile)
  const [ads, setAds] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, "ads"),
      orderBy("timestamp", "desc"),
      limit(5)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAds(data)
      setCurrentIndex(prev => data.length === 0 ? 0 : Math.min(prev, data.length - 1))
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Auto-slide ads every 10 seconds
  useEffect(() => {
    if (ads.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length)
    }, 10000)
    return () => clearInterval(timer)
  }, [ads.length])

  const handleDelete = async (id: string) => {
    if (!isAdmin) return
    if (confirm("Are you sure you want to delete this ad?")) {
      try {
        await deleteAd(id)
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
          Sponsored
        </h3>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            title="Create Ad"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative group">
        <AnimatePresence mode="wait">
          {ads.length > 0 ? (
            <motion.div
              key={ads[currentIndex].id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-2xl p-4 border border-border/50 relative overflow-hidden flex flex-col"
              style={{ maxHeight: '45vh' }}
            >
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider z-10 flex items-center gap-2">
                Ad
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(ads[currentIndex].id)
                    }}
                    className="p-1 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <div className="overflow-hidden rounded-xl mb-3 flex-1 relative min-h-0">
                <img 
                  src={ads[currentIndex].imageUrl} 
                  alt={ads[currentIndex].title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
              
              <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-1">{ads[currentIndex].title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {ads[currentIndex].description}
              </p>
              
              <a 
                href={ads[currentIndex].linkUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-center w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-colors"
              >
                Learn More
              </a>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 text-center space-y-3 border border-dashed border-white/10">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto opacity-50">
                <Megaphone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">No Ads Currently</p>
              </div>
              {isAdmin && (
                <button 
                  onClick={() => setShowModal(true)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  + Create Ad
                </button>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
          <CreateAdModal onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
