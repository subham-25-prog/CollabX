"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { useAuth } from "@/components/auth/auth-provider"
import { useNotifications, Notification } from "@/hooks/use-notifications"
import { markNotificationRead, getAllUsers } from "@/lib/db"
import { useRouter } from "next/navigation"
import { Bell, MessageSquare, Heart, Users, CheckCircle, XCircle, Info, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NotificationsPage() {
  const { profile, isLoading: authLoading } = useAuth()
  const { notifications, unreadCount } = useNotifications()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<"notifications" | "followers">("notifications")
  const [followers, setFollowers] = useState<any[]>([])
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false)

  useEffect(() => {
    if (!authLoading && !profile) {
      router.replace("/auth")
    }
  }, [profile, authLoading, router])

  useEffect(() => {
    async function fetchFollowers() {
      if (!profile || activeTab !== "followers") return
      setIsLoadingFollowers(true)
      try {
        const allUsers = await getAllUsers()
        const followerIds = profile.followers || []
        const matchedFollowers = allUsers.filter(u => followerIds.includes(u.id))
        setFollowers(matchedFollowers)
      } catch (error) {
        console.error("Failed to fetch followers:", error)
      } finally {
        setIsLoadingFollowers(false)
      }
    }
    fetchFollowers()
  }, [profile, activeTab])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read && profile?.uid) {
      await markNotificationRead(profile.uid, notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-5 h-5 text-blue-500" />
      case 'like': return <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
      case 'comment': return <MessageSquare className="w-5 h-5 text-green-500" />
      case 'follow': return <Users className="w-5 h-5 text-purple-500" />
      case 'application_accepted': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'application_rejected': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Info className="w-5 h-5 text-primary" />
    }
  }

  const renderMessage = (notif: Notification) => {
    if (!notif.senderId) return notif.message;

    let name = "";
    let restOfMessage = notif.message;

    if (notif.type === 'like' && notif.message.includes(" liked your post")) {
      name = notif.message.split(" liked your post")[0];
      restOfMessage = notif.message.substring(name.length);
    } else if (notif.type === 'comment' && notif.message.includes(" commented on your post")) {
      name = notif.message.split(" commented on your post")[0];
      restOfMessage = notif.message.substring(name.length);
    } else if (notif.type === 'follow' && notif.message.includes("Someone started following you")) {
      name = "Someone";
      restOfMessage = notif.message.substring(name.length);
    } else if (notif.type === 'application' && notif.message.includes("Someone applied to your project:")) {
      name = "Someone";
      restOfMessage = notif.message.substring(name.length);
    } else if (notif.type === 'invite_accepted' && notif.message.includes("A user has accepted your invitation")) {
      name = "A user";
      restOfMessage = notif.message.substring(name.length);
    } else if (notif.type === 'project_invite' && notif.message.includes(" invited you to join their project:")) {
      name = notif.message.split(" invited you to join their project:")[0];
      restOfMessage = notif.message.substring(name.length);
    }

    if (name) {
      return (
        <>
          <span 
            className="font-bold hover:underline cursor-pointer text-primary"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/profile?id=${notif.senderId}`);
            }}
          >
            {name}
          </span>
          {restOfMessage}
        </>
      );
    }

    return notif.message;
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pt-16 pb-20 lg:pb-8 w-full min-w-0">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Bell className="w-8 h-8 text-primary" />
                Activity
              </h1>

              {/* Tabs */}
              <div className="flex p-1 rounded-xl bg-secondary/50 backdrop-blur-md mb-6 w-max">
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "notifications" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Bell className="w-4 h-4" /> 
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-1 bg-primary text-primary-foreground text-xs font-bold px-1.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("followers")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "followers" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Users className="w-4 h-4" /> 
                  Followers
                  {(profile?.followers?.length || 0) > 0 && (
                    <span className="ml-1 text-xs opacity-70">
                      {profile?.followers?.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "notifications" ? (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    {notifications.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-foreground mb-1">No notifications yet</h3>
                        <p className="text-sm">When you get notifications, they'll show up here.</p>
                      </div>
                    ) : (
                      notifications.map((notif, index) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleNotificationClick(notif)}
                          className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                            notif.read ? 'glass hover:bg-secondary/80' : 'bg-primary/5 hover:bg-primary/10 border border-primary/20'
                          }`}
                        >
                          <div className="mt-1 shrink-0 p-3 rounded-full bg-background border border-border">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className={`text-base ${notif.read ? 'text-foreground' : 'text-foreground font-medium'}`}>
                              {renderMessage(notif)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {notif.timestamp?.toDate ? new Date(notif.timestamp.toDate()).toLocaleDateString() : 'Just now'}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2" />
                          )}
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="followers"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    {isLoadingFollowers ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : followers.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-foreground mb-1">No followers yet</h3>
                        <p className="text-sm">Share your profile or post content to gain followers.</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {followers.map((follower) => (
                          <Link 
                            key={follower.id} 
                            href={`/profile?id=${follower.id}`}
                            className="flex items-center gap-4 p-4 rounded-2xl glass hover:bg-secondary/80 transition-all"
                          >
                            <img 
                              src={follower.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${follower.name}`} 
                              alt={follower.name} 
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{follower.name}</h3>
                              <p className="text-sm text-muted-foreground">{follower.role || 'Student'}</p>
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                              View Profile
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
