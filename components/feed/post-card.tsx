"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Link as LinkIcon, Flag, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { toggleLikePost, voteOnPoll, deletePost } from "@/lib/db"
import { toast } from "sonner"
import { PostCommentsModal } from "./post-comments-modal"
import { AnimatePresence } from "framer-motion"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

interface PostCardProps {
  post: {
    id: string
    author: {
      id: string
      name: string
      avatar: string
      role: string
    }
    content: string
    image?: string
    images?: string[]
    likes: string[]
    commentsCount: number
    sharesCount: number
    timestamp: any
    poll?: {
      options: { id: string, text: string, votes: number }[]
      votedUsers: { [userId: string]: string }
    }
  }
}

export function PostCard({ post }: PostCardProps) {
  const { profile } = useAuth()
  
  const isLiked = profile ? post.likes.includes(profile.uid) : false
  const likesCount = post.likes.length
  const [isSaved, setIsSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Format timestamp safely
  const timeAgo = post.timestamp?.toDate ? formatTimeAgo(post.timestamp.toDate()) : "Just now"

  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const index = Math.round(scrollContainerRef.current.scrollLeft / scrollContainerRef.current.clientWidth)
      setCurrentImageIndex(index)
    }
  }

  const scrollPrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -scrollContainerRef.current.clientWidth, behavior: 'smooth' })
    }
  }

  const scrollNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollContainerRef.current.clientWidth, behavior: 'smooth' })
    }
  }

  const userVote = post.poll && profile ? post.poll.votedUsers?.[profile.uid] : null
  const totalVotes = post.poll ? post.poll.options.reduce((sum, opt) => sum + opt.votes, 0) : 0

  const handleVote = async (optionId: string) => {
    if (!profile || !post.poll || userVote) return
    try {
      await voteOnPoll(post.id, profile.uid, optionId)
    } catch (error: any) {
      toast.error("Failed to vote")
    }
  }

  const handleLike = async () => {
    if (!profile || isLiking) return
    
    setIsLiking(true)
    try {
      await toggleLikePost(post.id, profile.uid, isLiked, profile.name || "Someone") 
    } catch (error) {
      toast.error("Failed to like post")
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="glass sm:rounded-2xl rounded-none border-x-0 sm:border-x overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <Link href={`/profile?id=${post.author.id}`} className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <Image
              src={post.author.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=fallback"}
              alt={post.author.name || "User"}
              width={36}
              height={36}
              unoptimized
              className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/30 transition-all bg-secondary"
            />
          </motion.div>
          <div>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              {post.author.name}
            </h3>
            {post.author.role && <p className="text-xs text-muted-foreground">{post.author.role}</p>}
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-2 rounded-lg hover:bg-secondary/50 transition-colors outline-none">
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" className="glass rounded-xl p-1 min-w-[160px] shadow-xl z-50 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                <DropdownMenu.Item 
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg outline-none cursor-default hover:bg-secondary/80 focus:bg-secondary/80 text-foreground"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/feed?post=${post.id}`)
                    toast.success("Link copied to clipboard!")
                  }}
                >
                  <LinkIcon className="w-4 h-4" /> Copy Link
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-border my-1" />
                {profile?.uid === post.author.id ? (
                  <DropdownMenu.Item 
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg outline-none cursor-default hover:bg-destructive/10 focus:bg-destructive/10 text-destructive"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this post?")) {
                        try {
                          await deletePost(post.id)
                          toast.success("Post deleted successfully")
                        } catch (error) {
                          toast.error("Failed to delete post")
                        }
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" /> Delete Post
                  </DropdownMenu.Item>
                ) : (
                  <DropdownMenu.Item 
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg outline-none cursor-default hover:bg-destructive/10 focus:bg-destructive/10 text-destructive"
                    onClick={() => toast.success("Post reported")}
                  >
                    <Flag className="w-4 h-4" /> Report Post
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Images/Media */}
      {post.images && post.images.length > 0 ? (
        <div className="px-0 sm:px-0 relative group">
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {post.images.map((img, i) => (
              <div 
                key={i} 
                className="min-w-full snap-center overflow-hidden border-y sm:border border-border relative aspect-square bg-secondary cursor-pointer flex items-center justify-center"
                onClick={() => setSelectedImage(img)}
              >
                <img
                  src={img}
                  alt={`Post image ${i+1}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>

          {/* Navigation Buttons & Indicators */}
          {post.images.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {currentImageIndex < post.images.length - 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); scrollNext(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-md z-10 font-medium shadow-sm">
                {currentImageIndex + 1} / {post.images.length}
              </div>
            </>
          )}
        </div>
      ) : post.image ? (
        <div className="px-0 sm:px-0">
          <motion.div
            className="overflow-hidden border-y sm:border border-border relative bg-secondary cursor-pointer flex items-center justify-center"
            onClick={() => { if (!post.image?.match(/\.(mp4|webm|mov|ogg)/i)) setSelectedImage(post.image!) }}
          >
            {post.image.match(/\.(mp4|webm|mov|ogg)/i) ? (
              <video
                src={post.image}
                controls
                className="w-full max-h-[587px] object-contain bg-black"
              />
            ) : (
              <img
                src={post.image}
                alt="Post media"
                className="w-full max-h-[587px] object-contain"
              />
            )}
          </motion.div>
        </div>
      ) : null}

      {/* Poll */}
      {post.poll && (
        <div className="px-4 pb-4 space-y-2">
          {post.poll.options.map((option) => {
            const isWinner = false // could calculate if poll is closed
            const isVoted = userVote === option.id
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0

            return (
              <div 
                key={option.id} 
                onClick={() => handleVote(option.id)}
                className={`relative overflow-hidden rounded-xl border ${userVote ? 'border-transparent' : 'border-border hover:bg-secondary/50 cursor-pointer'} transition-colors group`}
              >
                {/* Progress bar background (only show if voted) */}
                {userVote && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`absolute inset-0 opacity-20 ${isVoted ? 'bg-primary' : 'bg-muted-foreground'}`}
                  />
                )}
                
                <div className="relative px-4 py-3 flex items-center justify-between">
                  <span className={`font-medium z-10 ${isVoted ? 'text-foreground font-bold' : 'text-foreground'}`}>
                    {option.text}
                  </span>
                  
                  {userVote && (
                    <span className={`font-medium z-10 ${isVoted ? 'text-primary' : 'text-muted-foreground'}`}>
                      {percentage}%
                    </span>
                  )}
                </div>
              </div>
            )
          })}
          <div className="text-sm text-muted-foreground mt-2">
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </div>
        </div>
      )}

      {/* Actions (Like, Comment, Share, Bookmark) */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleLike}
            className={`transition-colors ${isLiked ? "text-pink-500" : "text-foreground hover:text-muted-foreground"}`}
          >
            <Heart className={`w-[26px] h-[26px] ${isLiked ? "fill-current" : ""}`} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setShowComments(true)}
            className="text-foreground hover:text-muted-foreground transition-colors"
          >
            <MessageCircle className="w-[26px] h-[26px]" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={async () => {
              const url = `${window.location.origin}/feed?post=${post.id}`
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: `Post by ${post.author.name}`,
                    text: post.content,
                    url: url,
                  })
                } catch (error) {
                  console.error('Error sharing:', error)
                }
              } else {
                navigator.clipboard.writeText(url)
                toast.success("Link copied to clipboard!")
              }
            }}
            className="text-foreground hover:text-muted-foreground transition-colors"
          >
            <Share2 className="w-[26px] h-[26px]" />
          </motion.button>
        </div>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setIsSaved(!isSaved)}
          className={`transition-colors ${isSaved ? "text-foreground" : "text-foreground hover:text-muted-foreground"}`}
        >
          <Bookmark className={`w-[26px] h-[26px] ${isSaved ? "fill-current" : ""}`} />
        </motion.button>
      </div>

      {/* Likes */}
      {likesCount > 0 && (
        <div className="px-4 pb-1">
          <span className="font-semibold text-sm text-foreground">{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
        </div>
      )}

      {/* Content (Caption) */}
      {(post.content || !post.image) && (
        <div className="px-4 pb-1">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
            <Link href={`/profile?id=${post.author.id}`} className="font-semibold hover:underline mr-2">
              {post.author.name}
            </Link>
            {post.content}
          </p>
        </div>
      )}

      {/* Comments & Time */}
      <div className="px-4 pb-4 mt-1">
        {post.commentsCount > 0 && (
          <button 
            onClick={() => setShowComments(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            View all {post.commentsCount} comments
          </button>
        )}
        <div className="text-[11px] text-muted-foreground uppercase tracking-wide mt-1">
          {timeAgo}
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <PostCommentsModal post={post} onClose={() => setShowComments(false)} />
        )}
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Full screen"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button 
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/50 rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + "y ago"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + "mo ago"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + "d ago"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + "h ago"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + "m ago"
  return "Just now"
}
