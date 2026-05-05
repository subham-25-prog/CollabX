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
import { collection, query, orderBy, onSnapshot, doc, setDoc, addDoc, serverTimestamp, limit, getDocs, startAfter, where } from "firebase/firestore"
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
  const [posts, setPosts] = useState<any[]>([])
  const [newPosts, setNewPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [lastVisible, setLastVisible] = useState<any>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [pageLoadTime, setPageLoadTime] = useState<Date | null>(null)
  
  // Find post if postParam exists
  const selectedPost = postParam ? posts.find(p => p.id === postParam) || newPosts.find(p => p.id === postParam) : null

  useEffect(() => {
    if (!isAuthLoading && profile && profile.onboardingCompleted === false) {
      router.replace("/onboarding")
    }
  }, [profile, isAuthLoading, router])

  // Instagram-style Algorithm: Calculate Relevance Score
  const calculateRelevanceScore = React.useCallback((post: any, userProfile: any) => {
    let score = 0;
    
    // 1. Followed Author Boost
    if (userProfile?.following?.includes(post.author?.id)) {
      score += 50;
    }
    
    // 2. Shared Interests/Skills
    if (userProfile?.skills?.length > 0 && post.content) {
      const contentLower = post.content.toLowerCase();
      userProfile.skills.forEach((skill: string) => {
        if (contentLower.includes(skill.toLowerCase())) {
          score += 15;
        }
      });
    }

    // 3. Engagement (Likes/Comments)
    const engagement = (post.likes?.length || 0) * 2 + (post.commentsCount || 0) * 3;
    score += Math.min(engagement, 30); // Cap engagement boost

    // 4. Recency Penalty (older posts lose points)
    const postDate = post.timestamp?.toDate ? post.timestamp.toDate() : new Date();
    const hoursOld = (Date.now() - postDate.getTime()) / (1000 * 60 * 60);
    score -= (hoursOld * 0.5); 

    // 5. Discovery Randomness (Instagram-style variation)
    const randomBoost = Math.random() * 20; // 0 to 20 points
    score += randomBoost;

    return score;
  }, []);

  // Infinite Scroll Observer
  const observer = React.useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = React.useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPosts(true);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore]);

  const fetchPosts = async (isLoadMore = false) => {
    if (!profile) return;
    if (isLoadMore) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      let q = query(collection(db, "posts"), orderBy("timestamp", "desc"), limit(20));
      if (isLoadMore && lastVisible) {
        q = query(collection(db, "posts"), orderBy("timestamp", "desc"), startAfter(lastVisible), limit(20));
      }

      const snapshot = await getDocs(q);
      const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Calculate relevance and sort ONLY the fetched chunk
      // This prevents the entire timeline from shifting out of order when loading more
      const scoredPosts = fetchedPosts.map(post => ({
        ...post,
        _score: calculateRelevanceScore(post, profile)
      }));
      scoredPosts.sort((a, b) => b._score - a._score);

      if (isLoadMore) {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newUnique = scoredPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...newUnique];
        });
      } else {
        setPosts(scoredPosts);
        setPageLoadTime(new Date());
      }

      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }
      setHasMore(snapshot.docs.length === 20);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (profile && !pageLoadTime) {
      fetchPosts();
    }
  }, [profile, pageLoadTime, calculateRelevanceScore]);

  // Listen for NEW posts globally without crashing the feed
  useEffect(() => {
    if (!pageLoadTime) return;

    const q = query(
      collection(db, "posts"), 
      where("timestamp", ">", pageLoadTime), 
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newIncoming: any[] = [];
      snapshot.docChanges().forEach((change) => {
        // Only track newly created documents, ignore likes/comments on existing ones
        if (change.type === "added") {
          newIncoming.push({ id: change.doc.id, ...change.doc.data() });
        }
      });

      if (newIncoming.length > 0) {
        setNewPosts(prev => {
          const combined = [...newIncoming, ...prev];
          // Remove duplicates
          const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
          return unique;
        });
      }
    });

    return () => unsubscribe();
  }, [pageLoadTime]);

  const handleShowNewPosts = () => {
    const scoredNew = newPosts.map(post => ({
      ...post,
      _score: calculateRelevanceScore(post, profile)
    }));
    scoredNew.sort((a, b) => b._score - a._score);

    setPosts(prev => [...scoredNew, ...prev]);
    setNewPosts([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCreatePost={() => setShowCreatePost(true)} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 lg:ml-64 pt-16 pb-20 lg:pb-8">
          <div className="max-w-[620px] mx-auto px-0 sm:px-4 py-2 sm:py-6">
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

            {/* New Posts Indicator */}
            <AnimatePresence>
              {newPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="sticky top-20 z-30 flex justify-center mb-6"
                >
                  <button
                    onClick={handleShowNewPosts}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full gradient-primary text-primary-foreground font-bold shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    ↑ {newPosts.length} New Post{newPosts.length > 1 ? 's' : ''}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

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
              <div className="space-y-6 max-w-[540px] mx-auto w-full">
                {posts.map((post, index) => {
                  if (posts.length === index + 1) {
                    return (
                      <motion.div
                        ref={lastPostElementRef}
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <PostCard post={post as any} />
                      </motion.div>
                    )
                  } else {
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <PostCard post={post as any} />
                      </motion.div>
                    )
                  }
                })}
                
                {isLoadingMore && (
                  <div className="flex justify-center pt-4 pb-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
