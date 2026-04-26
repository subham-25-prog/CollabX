"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { PostCard } from "@/components/feed/post-card"
import { CreatePostModal } from "@/components/feed/create-post-modal"
import { motion, AnimatePresence } from "framer-motion"

const posts = [
  {
    id: "1",
    author: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      role: "Full Stack Developer",
    },
    content: "Just won first place at HackMIT 2024! Our team built an AI-powered accessibility tool that helps visually impaired users navigate web content. So grateful for my amazing teammates! 🏆",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop",
    likes: 234,
    comments: 45,
    shares: 12,
    timestamp: "2h ago",
    isLiked: false,
  },
  {
    id: "2",
    author: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      role: "ML Engineer",
    },
    content: "Looking for teammates for the upcoming Google Solution Challenge! Need a frontend dev and a UI/UX designer. We're building something to help local communities access mental health resources. DM if interested!",
    likes: 89,
    comments: 23,
    shares: 8,
    timestamp: "4h ago",
    isLiked: true,
  },
  {
    id: "3",
    author: {
      name: "Emily Park",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      role: "Product Designer",
    },
    content: "Just published my case study on redesigning the student collaboration experience. Interviewed 50+ students and discovered some surprising insights about team formation. Link in bio!",
    image: "https://images.unsplash.com/photo-1522542550221-31fd8575f45e?w=800&h=400&fit=crop",
    likes: 156,
    comments: 34,
    shares: 28,
    timestamp: "6h ago",
    isLiked: false,
  },
  {
    id: "4",
    author: {
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      role: "Backend Developer",
    },
    content: "Pro tip for hackathon teams: Set up your CI/CD pipeline BEFORE the hackathon starts. Just lost 2 hours debugging deployment issues. Learn from my mistakes! 😅",
    likes: 312,
    comments: 67,
    shares: 45,
    timestamp: "8h ago",
    isLiked: true,
  },
]

export default function FeedPage() {
  const [showCreatePost, setShowCreatePost] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCreatePost={() => setShowCreatePost(true)} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 lg:ml-64 pt-16 pb-20 lg:pb-8">
          <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Create post trigger - Desktop */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowCreatePost(true)}
              className="hidden lg:flex w-full items-center gap-4 p-4 mb-6 glass rounded-2xl transition-all duration-300 hover:border-primary/30"
            >
              <div className="w-10 h-10 rounded-full gradient-primary" />
              <span className="text-muted-foreground">Share something with your network...</span>
            </motion.button>

            {/* Posts feed */}
            <div className="space-y-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <MobileNav />

      <AnimatePresence>
        {showCreatePost && (
          <CreatePostModal onClose={() => setShowCreatePost(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
