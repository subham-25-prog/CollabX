"use client"

import React, { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { PostCard } from "@/components/feed/post-card"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"

const CreatePostModal = dynamic(() => import("@/components/feed/create-post-modal").then(mod => mod.CreatePostModal), { ssr: false })
const PostCommentsModal = dynamic(() => import("@/components/feed/post-comments-modal").then(mod => mod.PostCommentsModal), { ssr: false })
import { collection, query, orderBy, onSnapshot, doc, setDoc, addDoc, serverTimestamp, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2, Image, Smile, BarChart2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <FeedContent />
    </Suspense>
  )
}

function FeedContent() {
  const { profile, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const postParam = searchParams.get("post")
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [rawPosts, setRawPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [postLimit, setPostLimit] = useState(20)
  const [hasMore, setHasMore] = useState(true)
  
  // Find post if postParam exists
  const selectedPost = postParam ? rawPosts.find(p => p.id === postParam) : null



  useEffect(() => {
    if (!isAuthLoading && profile && profile.onboardingCompleted === false) {
      router.replace("/onboarding")
    }
  }, [profile, isAuthLoading, router])

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"), limit(postLimit))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setRawPosts(postsData)
      setHasMore(snapshot.docs.length === postLimit)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [postLimit])

  // Feed Algorithm: Prioritize posts from followed users, then sort by timestamp (which is already done by Firestore query)
  const posts = React.useMemo(() => {
    if (!profile || !profile.following || profile.following.length === 0) {
      return rawPosts
    }
    
    const followedPosts = rawPosts.filter(post => profile.following.includes(post.author?.id))
    const otherPosts = rawPosts.filter(post => !profile.following.includes(post.author?.id))
    
    return [...followedPosts, ...otherPosts]
  }, [rawPosts, profile])

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCreatePost={() => setShowCreatePost(true)} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 lg:ml-64 pt-16 pb-20 lg:pb-8">
          <div className="max-w-2xl mx-auto px-0 sm:px-4 py-2 sm:py-6">
            {/* Create post trigger - Desktop */}
            <motion.div
              whileHover={{ y: -2 }}
              className="hidden lg:flex w-full flex-col gap-3 p-4 mb-8 glass rounded-2xl border border-border/50 shadow-lg shadow-black/5"
            >
              <div className="flex items-center gap-4">
                <img
                  src={profile?.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=fallback"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 bg-secondary"
                />
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="flex-1 text-left px-5 py-3 rounded-full bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border transition-all text-muted-foreground hover:text-foreground outline-none text-lg"
                >
                  Share your next big idea, {profile?.name?.split(' ')[0] || 'student'}...
                </button>
              </div>
              <div className="flex items-center justify-between pl-16 pr-2">
                <div className="flex gap-1">
                  <button onClick={() => setShowCreatePost(true)} className="px-3 py-2 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center gap-2 text-sm font-semibold">
                    <Image className="w-5 h-5" /> Media
                  </button>
                  <button onClick={() => setShowCreatePost(true)} className="px-3 py-2 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center gap-2 text-sm font-semibold">
                    <Smile className="w-5 h-5" /> Emoji
                  </button>
                  <button onClick={() => setShowCreatePost(true)} className="px-3 py-2 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center gap-2 text-sm font-semibold">
                    <BarChart2 className="w-5 h-5" /> Poll
                  </button>
                </div>
                <button 
                  onClick={() => setShowCreatePost(true)}
                  className="px-6 py-2 rounded-full gradient-primary text-primary-foreground font-bold shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Post
                </button>
              </div>
            </motion.div>


            {/* Posts feed */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <PostCard post={post as any} />
                  </motion.div>
                ))}
                
                {hasMore && (
                  <div className="flex justify-center pt-4 pb-8">
                    <button
                      onClick={() => setPostLimit(prev => prev + 20)}
                      className="px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
                    >
                      Load More Posts
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileNav />

      <AnimatePresence>
        {showCreatePost && (
          <CreatePostModal onClose={() => setShowCreatePost(false)} />
        )}
        {selectedPost && (
          <PostCommentsModal 
            post={selectedPost} 
            onClose={() => {
              // Remove post param from URL without reloading
              const newUrl = window.location.pathname
              window.history.pushState({}, '', newUrl)
              // Force re-render to hide modal
              router.replace('/feed', { scroll: false })
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
