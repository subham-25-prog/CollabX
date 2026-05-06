"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, MessageSquare, Bug, Lightbulb, Heart, Loader2, Send } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { createFeedback } from "@/lib/db"
import { toast } from "sonner"

interface FeedbackModalProps {
  onClose: () => void
}

const FEEDBACK_TYPES = [
  { id: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'praise', label: 'Praise', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'other', label: 'Other', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
]

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const { profile } = useAuth()
  const [type, setType] = useState('suggestion')
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !profile) return

    setIsSubmitting(true)
    try {
      await createFeedback(profile.uid, profile.name, type, message)
      toast.success("Thanks for your feedback! 🚀")
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Failed to send feedback")
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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Send Feedback</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground ml-1">What kind of feedback do you have?</label>
            <div className="grid grid-cols-2 gap-3">
              {FEEDBACK_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    type === t.id 
                      ? `${t.bg} border-primary/50 scale-[1.02] shadow-lg` 
                      : 'border-white/5 hover:bg-white/5'
                  }`}
                >
                  <t.icon className={`w-5 h-5 ${t.color}`} />
                  <span className="text-sm font-semibold text-foreground">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground ml-1">Your message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
