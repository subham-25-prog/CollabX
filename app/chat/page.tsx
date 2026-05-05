"use client"

import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Sidebar } from "@/components/layout/sidebar"
import { ChatList } from "@/components/chat/chat-list"
import { ChatWindow } from "@/components/chat/chat-window"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { collection, query, where, onSnapshot, getDoc, doc, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useSearchParams, useRouter } from "next/navigation"
import { useNotifications } from "@/hooks/use-notifications"
import { markNotificationRead } from "@/lib/db"

function ChatContent() {
  const { profile: currentUser, isLoading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialChatId = searchParams.get("id")
  
  const [conversations, setConversations] = useState<any[]>([])
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
  useEffect(() => {
    const getConversations = async () => {
      const data = await Promise.all(chats.map(async (chat) => {
        let otherUser: any = { name: "Unknown User", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=fallback", online: false, isGroup: false }
        let otherUserId: string | undefined

        if (chat.type === 'project' && chat.projectId) {
          const projectDoc = await getDoc(doc(db, "projects", chat.projectId))
          if (projectDoc.exists()) {
            const pData = projectDoc.data()
            otherUser = {
              id: chat.projectId,
              name: pData.title,
              avatar: pData.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${chat.projectId}`,
              online: true,
              isGroup: true
            }
          }
        } else {
          otherUserId = chat.participants?.find((id: string) => id !== currentUser?.uid)
          const userData = otherUserId ? userProfiles[otherUserId] : null
          
          if (userData) {
            const lastActive = userData.lastActive?.toDate()
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
          timestamp: chat.updatedAt?.toDate ? formatTimeAgo(chat.updatedAt.toDate()) : "Just now",
          unread: unreadCount,
          updatedAt: chat.updatedAt?.toDate() || new Date(0)
        }
      }))

      data.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      setConversations(data)
    }

    getConversations()
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
              <div className="hidden lg:flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center opacity-50">
                    <svg
                      className="w-10 h-10 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Select a conversation
                  </h3>
                  <p className="text-muted-foreground">
                    Choose from your existing conversations or start a new one
                  </p>
                </div>
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

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + "y"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + "mo"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + "d"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + "h"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + "m"
  return "now"
}
