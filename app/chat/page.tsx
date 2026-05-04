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

  useEffect(() => {
    if (!currentUser) return

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid)
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = await Promise.all(
        snapshot.docs.map(async (chatDoc) => {
          const data = chatDoc.data()
          
          let otherUser: any = { name: "Unknown User", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=fallback", online: false, isGroup: false }
          let otherUserId: string | undefined
          
          if (data.type === 'project' && data.projectId) {
            const projectDoc = await getDoc(doc(db, "projects", data.projectId))
            if (projectDoc.exists()) {
              const pData = projectDoc.data()
              otherUser = {
                id: data.projectId,
                name: pData.title,
                avatar: pData.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${data.projectId}`,
                online: true,
                isGroup: true
              }
            }
          } else {
            // Find the other participant's ID
            otherUserId = data.participants.find((id: string) => id !== currentUser.uid)
            
            if (otherUserId) {
              const userDoc = await getDoc(doc(db, "users", otherUserId))
              if (userDoc.exists()) {
                const userData = userDoc.data()
                const lastActive = userData.lastActive?.toDate()
                const isOnline = lastActive ? (new Date().getTime() - lastActive.getTime()) < 10 * 60 * 1000 : false
                
                otherUser = {
                  id: otherUserId,
                  name: userData.name,
                  avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUserId}`,
                  online: isOnline,
                  isGroup: false
                }
              }
            }
          }

          // Count unread notifications for this user/chat
          const unreadCount = notifications.filter(
            n => !n.read && n.type === 'message' && (n.senderId === otherUserId || n.link?.includes(`id=${chatDoc.id}`))
          ).length

          return {
            id: chatDoc.id,
            user: otherUser,
            lastMessage: data.lastMessage || "No messages yet",
            timestamp: data.updatedAt?.toDate ? formatTimeAgo(data.updatedAt.toDate()) : "Just now",
            unread: unreadCount,
            updatedAt: data.updatedAt?.toDate() || new Date(0)
          }
        })
      )
      
      // Sort by updatedAt descending
      chatsData.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      
      setConversations(chatsData)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser, notifications])

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
    <div className="min-h-screen bg-background flex flex-col h-[100dvh]">
      <div className={!isMobileListVisible ? "hidden lg:block" : ""}>
        <Navbar />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 lg:ml-64 w-full min-w-0 flex flex-col">
          <main className={`${isMobileListVisible ? 'pt-16 pb-20' : 'pt-0 pb-0'} lg:pt-16 lg:pb-0 flex-1 flex flex-col h-full`}>
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
            } lg:flex flex-1 flex-col relative`}
          >
            {selectedConversation ? (
              <>
                {/* Mobile back button */}
                <div className="lg:hidden flex items-center gap-3 p-4 border-b border-border glass-strong z-10">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBackToList}
                    className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                  <img
                    src={selectedConversation.user.avatar}
                    alt={selectedConversation.user.name}
                    className="w-10 h-10 rounded-full object-cover bg-secondary"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {selectedConversation.user.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.user.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                
                {/* The ChatWindow component fetches messages itself */}
                <ChatWindow
                  conversation={selectedConversation}
                  chatId={selectedChat!}
                />
              </>
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
      <div className={!isMobileListVisible ? "hidden lg:block" : ""}>
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
