"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { createComment } from "@/lib/db"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import Link from "next/link"

interface PostCommentsModalProps {
  post: any
  onClose: () => void
}

export function PostCommentsModal({ post, onClose }: PostCommentsModalProps) {
  const { profile } = useAuth()
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!post?.id) return

    const commentsRef = collection(db, "posts", post.id, "comments")
    const q = query(commentsRef, orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestampFormatted: doc.data().timestamp?.toDate 
          ? formatTimeAgoShort(doc.data().timestamp.toDate()) 
          : "now"
      }))
      setComments(commentsData)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [post?.id])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newComment.trim() || !profile || !post?.id) return

    setIsSending(true)
    const commentText = newComment
    setNewComment("")

    try {
      await createComment(post.id, {
        id: profile.uid,
        name: profile.name,
        avatar: profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`
      }, commentText)
      toast.success("Comment added")
    } catch (error) {
      console.error("Failed to add comment", error)
      toast.error("Failed to add comment")
      setNewComment(commentText)
    } finally {
      setIsSending(false)
    }
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
        className="w-full max-w-lg bg-background border border-border rounded-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border z-10 shrink-0">
          <div className="w-8"></div> {/* Spacer for centering */}
          <h2 className="text-base font-bold text-foreground">Comments</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/50 transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {/* Post Author Caption as first comment (optional, matching Instagram) */}
          {post?.content && (
            <div className="flex gap-3 pb-4 border-b border-border/50">
              <Link href={`/profile?id=${post.author.id}`} className="shrink-0 mt-1">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-9 h-9 rounded-full object-cover bg-secondary"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <Link href={`/profile?id=${post.author.id}`} className="font-semibold hover:opacity-80 mr-2">
                    {post.author.name}
                  </Link>
                  {post.content}
                </p>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground font-medium">
                  <span>{post.timestamp?.toDate ? formatTimeAgoShort(post.timestamp.toDate()) : "now"}</span>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-xl font-bold text-foreground mb-1">No comments yet.</p>
              <p className="text-sm text-muted-foreground">Start the conversation.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                <Link href={`/profile?id=${comment.author.id}`} className="shrink-0 mt-1">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-9 h-9 rounded-full object-cover bg-secondary"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <Link href={`/profile?id=${comment.author.id}`} className="font-semibold hover:opacity-80 mr-2">
                      {comment.author.name}
                    </Link>
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground font-medium">
                    <span>{comment.timestampFormatted}</span>
                    <button className="hover:text-foreground transition-colors font-semibold">Reply</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <img
              src={profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || 'fallback'}`}
              alt="You"
              className="w-9 h-9 rounded-full object-cover bg-secondary shrink-0"
            />
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-foreground text-sm placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSending}
              className="px-2 py-1 text-primary font-semibold text-sm hover:text-primary/80 transition-colors disabled:opacity-50 disabled:hover:text-primary flex items-center"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

function formatTimeAgoShort(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + "y"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + "mo"
  interval = seconds / 604800
  if (interval > 1) return Math.floor(interval) + "w"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + "d"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + "h"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + "m"
  return "now"
}
