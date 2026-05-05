"use client"

import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Image as ImageIcon, Sparkles, PartyPopper, Cake, Trophy, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { createCelebration } from "@/lib/db"
import { toast } from "sonner"
import { compressImageToBase64 } from "@/lib/image-utils"

interface CreateCelebrationModalProps {
  onClose: () => void
}

const THEMES = [
  { id: 'birthday', label: 'Birthday', icon: Cake, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'achievement', label: 'Achievement', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 'celebration', label: 'Celebrate', icon: PartyPopper, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'shoutout', label: 'Shoutout', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-500/10' },
]

export function CreateCelebrationModal({ onClose }: CreateCelebrationModalProps) {
  const { profile } = useAuth()
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be smaller than 5MB")
        return
      }
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !image || !profile) {
      toast.error("Please provide both a wish and an image!")
      return
    }

    setIsSubmitting(true)
    try {
      // Compress and upload to ImgBB
      const compressedFile = await compressImageToBase64(image, 1200)
      const base64Data = compressedFile.split(',')[1]
      const formData = new FormData()
      formData.append("image", base64Data)
      
      const response = await fetch("https://api.imgbb.com/1/upload?key=6e38ec9c63ca880872d00fe6e4be0417", {
        method: "POST",
        body: formData
      })
      const uploadData = await response.json()
      
      if (!uploadData.success) throw new Error("Image upload failed")

      await createCelebration(
        { id: profile.uid, name: profile.name, avatar: profile.avatar },
        content,
        uploadData.data.url,
        selectedTheme.id
      )

      toast.success("Celebration posted to the Billboard! 🎉")
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Failed to post celebration")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg glass-strong rounded-3xl overflow-hidden shadow-2xl border border-white/20"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${selectedTheme.bg}`}>
              <selectedTheme.icon className={`w-6 h-6 ${selectedTheme.color}`} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Post a Wish</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Theme Selector */}
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedTheme(theme)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                  selectedTheme.id === theme.id 
                    ? `border-${theme.color.split('-')[1]}-500/50 ${theme.bg} scale-105` 
                    : 'border-transparent hover:bg-white/5'
                }`}
              >
                <theme.icon className={`w-5 h-5 ${theme.color}`} />
                <span className="text-[10px] font-medium text-foreground">{theme.label}</span>
              </button>
            ))}
          </div>

          {/* Image Upload */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-video rounded-2xl border-2 border-dashed border-white/20 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden flex flex-col items-center justify-center bg-white/5 ${imagePreview ? 'border-none' : ''}`}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-medium">Change Image</p>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Add a Photo</p>
                <p className="text-xs text-muted-foreground mt-1">Make it special!</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* Wish Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground pl-1">Your Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your celebration wish here..."
              className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Post to Billboard
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
