"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Image, Smile, MapPin, Users, Loader2 } from "lucide-react"

interface CreatePostModalProps {
  onClose: () => void
}

export function CreatePostModal({ onClose }: CreatePostModalProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!content.trim()) return
    
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    onClose()
  }

  const handleImageSelect = () => {
    // Simulate image selection
    setSelectedImage("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Create Post</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Author info */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
              alt="Your profile"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div>
              <p className="font-medium text-foreground">Tom Wilson</p>
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Users className="w-3.5 h-3.5" />
                Public
              </button>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share your latest project, achievement, or looking for teammates..."
            className="w-full min-h-[150px] bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-lg leading-relaxed"
            autoFocus
          />

          {/* Selected image preview */}
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="relative mt-4 rounded-xl overflow-hidden"
            >
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-auto object-cover rounded-xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleImageSelect}
                className="p-3 rounded-xl hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-primary"
              >
                <Image className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-xl hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-primary"
              >
                <Smile className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-xl hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-primary"
              >
                <MapPin className="w-5 h-5" />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={!content.trim() || isLoading}
              className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
