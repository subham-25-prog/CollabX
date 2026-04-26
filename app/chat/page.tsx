"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ChatList } from "@/components/chat/chat-list"
import { ChatWindow } from "@/components/chat/chat-window"
import { ArrowLeft } from "lucide-react"

const conversations = [
  {
    id: "1",
    user: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      online: true,
    },
    lastMessage: "That sounds great! Let's set up a call tomorrow.",
    timestamp: "2m ago",
    unread: 2,
  },
  {
    id: "2",
    user: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      online: true,
    },
    lastMessage: "I've pushed the latest changes to the repo. Check it out!",
    timestamp: "1h ago",
    unread: 0,
  },
  {
    id: "3",
    user: {
      name: "Emily Park",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      online: false,
    },
    lastMessage: "Thanks for the feedback on the designs!",
    timestamp: "3h ago",
    unread: 0,
  },
  {
    id: "4",
    user: {
      name: "HackMIT Team",
      avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
      online: true,
      isGroup: true,
    },
    lastMessage: "Marcus: We should finalize the pitch deck today",
    timestamp: "5h ago",
    unread: 5,
  },
  {
    id: "5",
    user: {
      name: "David Kim",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
      online: false,
    },
    lastMessage: "Let me know if you need any help with the data pipeline.",
    timestamp: "1d ago",
    unread: 0,
  },
]

const messages = [
  {
    id: "1",
    content: "Hey! I saw your profile and I'm really impressed with your work on AI Study Buddy.",
    sender: "them",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    content: "Thank you so much! It was a fun project to work on. Are you also interested in EdTech?",
    sender: "me",
    timestamp: "10:32 AM",
  },
  {
    id: "3",
    content: "Yes! Actually, I'm putting together a team for HackMIT next month. We're building something in the education space.",
    sender: "them",
    timestamp: "10:35 AM",
  },
  {
    id: "4",
    content: "That sounds exciting! What kind of project are you thinking about?",
    sender: "me",
    timestamp: "10:36 AM",
  },
  {
    id: "5",
    content: "We want to create an AI-powered tutoring platform that adapts to each student's learning style. I think your experience with ML would be perfect for this!",
    sender: "them",
    timestamp: "10:40 AM",
  },
  {
    id: "6",
    content: "That's exactly the kind of project I love working on! Count me in. What's the team looking like so far?",
    sender: "me",
    timestamp: "10:42 AM",
  },
  {
    id: "7",
    content: "That sounds great! Let's set up a call tomorrow to discuss the details and meet the rest of the team.",
    sender: "them",
    timestamp: "10:45 AM",
  },
]

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isMobileListVisible, setIsMobileListVisible] = useState(true)

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId)
    setIsMobileListVisible(false)
  }

  const handleBackToList = () => {
    setIsMobileListVisible(true)
    setSelectedChat(null)
  }

  const selectedConversation = conversations.find((c) => c.id === selectedChat)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16 pb-20 lg:pb-0 h-screen flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* Chat list - Desktop always visible, Mobile conditional */}
          <div
            className={`${
              isMobileListVisible ? "flex" : "hidden"
            } lg:flex w-full lg:w-80 xl:w-96 flex-col border-r border-border glass-strong`}
          >
            <ChatList
              conversations={conversations}
              selectedId={selectedChat}
              onSelect={handleSelectChat}
            />
          </div>

          {/* Chat window - Desktop always visible, Mobile conditional */}
          <div
            className={`${
              !isMobileListVisible ? "flex" : "hidden"
            } lg:flex flex-1 flex-col`}
          >
            {selectedConversation ? (
              <>
                {/* Mobile back button */}
                <div className="lg:hidden flex items-center gap-3 p-4 border-b border-border glass-strong">
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
                    className="w-10 h-10 rounded-full object-cover"
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
                <ChatWindow
                  conversation={selectedConversation}
                  messages={messages}
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

      <MobileNav />
    </div>
  )
}
