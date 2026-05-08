"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Sidebar } from "@/components/layout/sidebar"
import { ChatList } from "@/components/chat/chat-list"
import { ChatWindow } from "@/components/chat/chat-window"
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { collection, query, where, onSnapshot, getDoc, doc, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useSearchParams, useRouter } from "next/navigation"
import { useNotifications } from "@/hooks/use-notifications"
import { markNotificationRead } from "@/lib/db"
import { formatTimeAgo } from "@/lib/utils"

function ChatContent() {
  const { profile: currentUser, isLoading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialChatId = searchParams.get("id")
  
  const [selectedChat, setSelectedChat] = useState<string | null>(initialChatId)
  const [isMobileListVisible, setIsMobileListVisible] = useState(!initialChatId)
  const [isLoading, setIsLoading] = useState(true)
  const { notifications } = useNotifications()

  useEffect(() => {
    if (!authLoading && currentUser && currentUser.onboardingCompleted === false) {
      router.replace("/onboarding")
    }
  }, [currentUser, authLoading, router])

  const [chats, setChats] = useState<any[]>([])
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({})
  const [now, setNow] = useState(Date.now())

  // Force re-render every 30s to update "online" status based on lastActive
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!currentUser) return

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setChats(chatsData)
    })

    return () => unsubscribe()
  }, [currentUser])

  // Listen to user profiles for all participants
  useEffect(() => {
    if (chats.length === 0) {
      setIsLoading(false)
      return
    }

    const otherUserIds = new Set<string>()
    chats.forEach(chat => {
      chat.participants?.forEach((id: string) => {
        if (id !== currentUser?.uid) otherUserIds.add(id)
      })
    })

    const unsubscribes: (() => void)[] = []

    otherUserIds.forEach(userId => {
      const unsub = onSnapshot(doc(db, "users", userId), (userDoc) => {
        if (userDoc.exists()) {
          setUserProfiles(prev => ({
            ...prev,
            [userId]: { ...userDoc.data(), id: userId }
          }))
        }
      })
      unsubscribes.push(unsub)
    })

    setIsLoading(false)
    return () => unsubscribes.forEach(unsub => unsub())
  }, [chats, currentUser])

  // Derive conversations from chats and userProfiles
  // Memoize conversation data for stability and performance
  const conversations = useMemo(() => {
    const data = chats.map((chat) => {
      let otherUser: any = { 
        id: chat.id, 
        name: "Unknown User", 
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=fallback", 
        online: false, 
        isGroup: chat.type === 'project' 
      }
      let otherUserId: string | undefined

      if (chat.type === 'project' && chat.projectId) {
        // Project chats usually have the project title as name
        otherUser = {
          id: chat.projectId,
          name: chat.projectName || "Project Team",
          avatar: chat.projectAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${chat.projectId}`,
          online: true,
          isGroup: true
        }
      } else {
        otherUserId = chat.participants?.find((id: string) => id !== currentUser?.uid)
        const userData = otherUserId ? userProfiles[otherUserId] : null
        
        if (userData) {
          const lastActive = userData.lastActive?.toDate ? userData.lastActive.toDate() : null
          const isOnline = lastActive ? (Date.now() - lastActive.getTime()) < 60 * 1000 : false
          
          otherUser = {
            id: otherUserId,
            name: userData.name,
            avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUserId}`,
            online: isOnline,
            isGroup: false
          }
        }
      }

      const unreadCount = notifications.filter(
        n => !n.read && n.type === 'message' && (n.senderId === otherUserId || n.link?.includes(`id=${chat.id}`))
      ).length

      return {
        id: chat.id,
        user: otherUser,
        lastMessage: chat.lastMessage || "No messages yet",
        timestamp: formatTimeAgo(chat.updatedAt),
        unread: unreadCount,
        updatedAt: chat.updatedAt?.toDate() || new Date(0)
      }
    })

    return data.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }, [chats, userProfiles, notifications, currentUser, now])

  // Mark notifications as read when chat is selected or on initial load
  useEffect(() => {
    if (selectedChat && currentUser && notifications.length > 0) {
      const chat = conversations.find(c => c.id === selectedChat)
      const otherUserId = chat?.user?.id

      const unreadNotifs = notifications.filter(
        n => !n.read && n.type === 'message' && (
          n.senderId === otherUserId || 
          n.link?.includes(`id=${selectedChat}`) ||
          n.link?.includes(selectedChat)
        )
      )
      
      if (unreadNotifs.length > 0) {
        unreadNotifs.forEach(n => markNotificationRead(currentUser.uid, n.id))
      }
    }
  }, [selectedChat, currentUser, notifications, conversations])

  const handleSelectChat = async (chatId: string) => {
    setSelectedChat(chatId)
    setIsMobileListVisible(false)

    // Mark notifications from this chat as read
    const chat = conversations.find(c => c.id === chatId)
    if (chat && currentUser) {
      const unreadNotifs = notifications.filter(
        n => !n.read && n.type === 'message' && (n.senderId === chat.user.id || n.link?.includes(`id=${chatId}`))
      )
      
      for (const n of unreadNotifs) {
        await markNotificationRead(currentUser.uid, n.id)
      }
    }
  }

  const handleBackToList = () => {
    setIsMobileListVisible(true)
    setSelectedChat(null)
  }

  const selectedConversation = conversations.find((c) => c.id === selectedChat)

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      <div className={`${!isMobileListVisible ? "hidden lg:block" : ""} shrink-0`}>
        <Navbar />
      </div>
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 lg:ml-64 w-full min-w-0 flex flex-col relative overflow-hidden">
          <main className={`${isMobileListVisible ? 'pt-16 pb-20' : 'pt-0 pb-0'} lg:pt-16 lg:pb-0 flex-1 flex flex-col overflow-hidden`}>
            <div className="flex-1 flex overflow-hidden">
          {/* Chat list - Desktop always visible, Mobile conditional */}
          <div
            className={`${
              isMobileListVisible ? "flex" : "hidden"
            } lg:flex w-full lg:w-80 xl:w-96 flex-col border-r border-border glass-strong relative`}
          >
            {isLoading ? (
              <div className="absolute inset-0 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <ChatList
                conversations={conversations}
                selectedId={selectedChat}
                onSelect={handleSelectChat}
              />
            )}
          </div>

          {/* Chat window - Desktop always visible, Mobile conditional */}
          <div
            className={`${
              !isMobileListVisible ? "flex" : "hidden"
            } lg:flex flex-1 flex-col relative overflow-hidden h-full`}
          >
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                chatId={selectedChat!}
                onBack={handleBackToList}
              />
            ) : (
              <div className="hidden lg:flex flex-1 items-center justify-center bg-secondary/5">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center max-w-sm px-6"
                >
                  <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-primary/20 to-primary/5 mx-auto mb-6 flex items-center justify-center shadow-inner">
                    <MessageSquare className="w-12 h-12 text-primary opacity-80" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Your Messages
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Select a conversation from the list to start chatting with your team or colleagues.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">Real-time</span>
                    <span className="px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-semibold">Secure</span>
                    <span className="px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-semibold">Collaborative</span>
                  </div>
                </motion.div>
              </div>
            )}
            </div>
            </div>
          </main>
        </div>
      </div>
      <div className={`${!isMobileListVisible ? "hidden" : "lg:block"} shrink-0`}>
        <MobileNav />
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[100dvh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ChatContent />
    </Suspense>
  )
}

