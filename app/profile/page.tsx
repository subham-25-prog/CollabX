"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Sidebar } from "@/components/layout/sidebar"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { PostCard } from "@/components/feed/post-card"
import { useAuth } from "@/components/auth/auth-provider"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

function ProfileContent() {
  const { profile: currentUser, isLoading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const profileId = searchParams.get("id")
  
  const [activeTab, setActiveTab] = useState("posts")
  const [profile, setProfile] = useState<any>(null)
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [userTeams, setUserTeams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && currentUser && currentUser.onboardingCompleted === false) {
      router.replace("/onboarding")
    }
  }, [currentUser, authLoading, router])

  useEffect(() => {
    if (authLoading || !profileId && !currentUser) return

    let targetUserId = profileId || currentUser?.uid
    if (!targetUserId) return

    setIsLoading(true)

    // 1. Fetch/Listen to Profile Data
    const unsubProfile = onSnapshot(doc(db, "users", targetUserId), (docSnap) => {
      if (docSnap.exists()) {
        setProfile({ uid: docSnap.id, ...docSnap.data() })
      } else if (!profileId && currentUser) {
        setProfile(currentUser)
      }
      setIsLoading(false)
    })

    // 2. Listen to Posts
    const postsQuery = query(
      collection(db, "posts"),
      where("author.id", "==", targetUserId),
      orderBy("timestamp", "desc")
    )
    const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
      setUserPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    // 3. Listen to Teams
    const teamsQuery = query(
      collection(db, "projects"),
      where("members", "array-contains", targetUserId),
      orderBy("createdAt", "desc")
    )
    const unsubTeams = onSnapshot(teamsQuery, (snapshot) => {
      setUserTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    return () => {
      unsubProfile()
      unsubPosts()
      unsubTeams()
    }
  }, [profileId, currentUser, authLoading])

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    )
  }

  const isOwnProfile = currentUser?.uid === profile.uid
  const achievements = profile.achievements || []
  const projects = profile.projects || []

  return (
    <main className="pt-16 pb-20 lg:pb-8">
      <ProfileHeader 
        profile={{
          ...profile,
          postsCount: userPosts.length,
          teamsCount: userTeams.length,
          projectsCount: (profile.projects || []).length
        }} 
        isOwnProfile={isOwnProfile} 
      />
      
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <ProfileTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          counts={{
            posts: userPosts.length,
            achievements: (profile.achievements || []).length,
            projects: (profile.projects || []).length,
            teams: userTeams.length
          }}
        />
        
        {/* Content based on active tab */}
        <div className="mt-6">
          {activeTab === "posts" && (
            <div className="space-y-6 max-w-[470px] mx-auto">
              {userPosts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No posts yet.</p>
              ) : (
                userPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <PostCard post={post as any} />
                  </motion.div>
                ))
              )}
            </div>
          )}
          
          {activeTab === "achievements" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 col-span-2">No achievements added yet.</p>
              ) : (
                achievements.map((achievement: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="glass rounded-2xl p-5 flex items-center gap-4"
                  >
                    <div className={`w-14 h-14 rounded-xl ${achievement.color || 'bg-primary/20'} flex items-center justify-center text-2xl`}>
                      {achievement.icon || '🏆'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
          
          {activeTab === "projects" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 col-span-2">No projects added yet.</p>
              ) : (
                projects.map((project: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="glass rounded-2xl overflow-hidden group"
                  >
                    {project.image && (
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{project.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {(project.tags || []).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
          
          {activeTab === "teams" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userTeams.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 col-span-2">No team collaborations yet.</p>
              ) : (
                userTeams.map((project: any, index: number) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="glass rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-foreground">{project.title}</h3>
                          <p className="text-xs text-muted-foreground">{project.type || 'Project'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${project.status === 'open' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {(project.members || []).slice(0, 3).map((mId: string, i: number) => (
                            <img key={i} src={`https://api.dicebear.com/7.x/initials/svg?seed=${mId}`} className="w-6 h-6 rounded-full border-2 border-background" alt="" />
                          ))}
                        </div>
                        <Link href={`/teams?project=${project.id}`} className="text-xs font-semibold text-primary hover:underline">
                          View Team
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64 w-full min-w-0">
          <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <ProfileContent />
          </Suspense>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}
