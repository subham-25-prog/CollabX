"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react"

interface PostCardProps {
  post: {
    id: string
    author: {
      name: string
      avatar: string
      role: string
    }
    content: string
    image?: string
    likes: number
    comments: number
    shares: number
    timestamp: string
    isLiked: boolean
  }
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [isSaved, setIsSaved] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <Link href="/profile" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/30 transition-all"
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
          <span className="text-sm text-muted-foreground">{post.timestamp}</span>
          <button className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="px-4 pb-3">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="rounded-xl overflow-hidden"
          >
            <img
              src={post.image}
              alt="Post image"
              className="w-full h-auto object-cover"
            />
          </motion.div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground border-y border-border/50">
        <span>{likesCount} likes</span>
        <div className="flex items-center gap-4">
          <span>{post.comments} comments</span>
          <span>{post.shares} shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Comment</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Share</span>
          </motion.button>
        </div>

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
    </motion.article>
  )
}
