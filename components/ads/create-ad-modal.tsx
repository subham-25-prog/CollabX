"use client"

import React, { useState, useRef } from "react"
import { motion } from "framer-motion"
import { X, Image as ImageIcon, Loader2, Link as LinkIcon, BadgePercent } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { createAd } from "@/lib/db"
import { toast } from "sonner"
import { compressImageToBase64 } from "@/lib/image-utils"

interface CreateAdModalProps {
  onClose: () => void
}

export function CreateAdModal({ onClose }: CreateAdModalProps) {
  const { profile } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
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
    if (!title.trim() || !description.trim() || !linkUrl.trim() || !image || !profile) {
      toast.error("Please fill all fields and provide an image!")
      return
    }

    setIsSubmitting(true)
    try {
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

      await createAd(
        { id: profile.uid, name: profile.name, avatar: profile.avatar },
        title,
        description,
        uploadData.data.url,
        linkUrl
      )

      toast.success("Ad posted successfully!")
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Failed to post ad")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-strong rounded-3xl overflow-hidden shadow-2xl border border-white/20"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl bg-purple-500/10`}>
              <BadgePercent className={`w-6 h-6 text-purple-500`} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Create Advertisement</h2>
          </div>
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} 
            className="p-2 rounded-full hover:bg-white/10 transition-colors z-50 relative cursor-pointer"
          >
            <X className="w-6 h-6 text-muted-foreground hover:text-white transition-colors" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-video rounded-2xl border-2 border-dashed border-white/20 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden flex flex-col items-center justify-center bg-white/5 ${imagePreview ? 'border-none' : ''}`}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-medium">Change Cover</p>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Add Ad Banner</p>
                <p className="text-xs text-muted-foreground mt-1">Recommended 16:9 ratio</p>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground pl-1">Ad Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Boost Your Coding Skills"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground pl-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description for your ad..."
              className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground pl-1">Target Link</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Publish Ad"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
