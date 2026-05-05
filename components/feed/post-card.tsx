"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Link as LinkIcon, Flag, Trash2 } from "lucide-react"
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

  // Format timestamp safely
  const timeAgo = post.timestamp?.toDate ? formatTimeAgo(post.timestamp.toDate()) : "Just now"

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
      <div className="flex items-center justify-between p-4 pb-3">
        <Link href={`/profile?id=${post.author.id}`} className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <Image
              src={post.author.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=fallback"}
              alt={post.author.name || "User"}
              width={44}
              height={44}
              unoptimized
              className="w-11 h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/30 transition-all bg-secondary"
            />
          </motion.div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {post.author.name}
            </h3>
            <p className="text-sm text-muted-foreground">{post.author.role}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{timeAgo}</span>
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

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Images/Media */}
      {post.images && post.images.length > 0 ? (
        <div className="px-0 sm:px-4 pb-3">
          <div className="flex overflow-x-auto snap-x snap-mandatory custom-scrollbar gap-1 sm:rounded-xl">
            {post.images.map((img, i) => (
              <div key={i} className="min-w-full snap-center sm:rounded-xl overflow-hidden border-y sm:border border-border relative">
                <Image
                  src={img}
                  alt={`Post image ${i+1}`}
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover max-h-[500px]"
                />
                {post.images!.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {i + 1} / {post.images!.length}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : post.image ? (
        <div className="px-0 sm:px-4 pb-3">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="sm:rounded-xl rounded-none overflow-hidden border-y sm:border border-border"
          >
            {post.image.match(/\.(mp4|webm|mov|ogg)/i) ? (
              <video
                src={post.image}
                controls
                className="w-full h-auto object-cover max-h-[500px] bg-black/10"
              />
            ) : (
              <Image
                src={post.image}
                alt="Post media"
                width={800}
                height={500}
                className="w-full h-auto object-cover max-h-[500px]"
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

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground border-y border-border/50">
        <span>{likesCount} likes</span>
        <div className="flex items-center gap-4">
          <span>{post.commentsCount} comments</span>
          <span>{post.sharesCount} shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
              isLiked 
                ? "text-pink-500 bg-pink-500/10" 
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">Like</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowComments(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Comment</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
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
            className="flex items-center gap-2 px-2.5 sm:px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Share</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSaved(!isSaved)}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              isSaved 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <PostCommentsModal post={post} onClose={() => setShowComments(false)} />
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
