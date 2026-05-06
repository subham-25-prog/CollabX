"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Trash2, Plus, Megaphone } from "lucide-react"
import { deleteAd } from "@/lib/db"
import { useAuth } from "@/components/auth/auth-provider"
import { CreateAdModal } from "./create-ad-modal"

export function AdWidget() {
  const { profile } = useAuth()
  const [ads, setAds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const isAdmin = profile?.role === 'admin' || profile?.email === 'shubhamoy27@gmail.com'

  useEffect(() => {
    const q = query(
      collection(db, "ads"),
      orderBy("timestamp", "desc"),
      limit(3)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAds(data)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAdmin) return
    if (confirm("Are you sure you want to delete this ad?")) {
      try {
        await deleteAd(id)
      } catch (error) {
        console.error("Failed to delete ad", error)
      }
    }
  }

  if (isLoading) return null

  return (
    <div className="w-full space-y-4">
      {isAdmin && (
        <div className="flex justify-end px-1">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" /> Create Ad
          </button>
        </div>
      )}

      {ads.length > 0 ? (
        ads.map((ad) => (
          <div key={ad.id} className="glass rounded-2xl p-4 border border-border/50 relative overflow-hidden group">
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <div className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                Ad
              </div>
              {isAdmin && (
                <button
                  onClick={(e) => handleDelete(ad.id, e)}
                  className="p-1 rounded bg-black/40 text-red-500 hover:bg-red-500 hover:text-white backdrop-blur-md transition-colors"
                  title="Delete Ad"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            <div className="overflow-hidden rounded-xl mb-3 h-32 relative">
              <img 
                src={ad.imageUrl} 
                alt={ad.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>
            
            <h3 className="text-sm font-bold text-foreground mb-1">{ad.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {ad.description}
            </p>
            
            <a 
              href={ad.linkUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-center w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-colors"
            >
              Learn More
            </a>
          </div>
        ))
      ) : isAdmin ? (
        <div className="glass rounded-2xl p-6 text-center space-y-3 border border-dashed border-white/10">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto opacity-50">
            <Megaphone className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No Ads Running</p>
            <p className="text-xs text-muted-foreground mt-1">Create an ad to display here.</p>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {showModal && (
          <CreateAdModal onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
