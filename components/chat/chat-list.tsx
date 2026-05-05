"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Search, Edit } from "lucide-react"

interface Conversation {
  id: string
  user: {
    name: string
    avatar: string
    online: boolean
    isGroup?: boolean
  }
  lastMessage: string
  timestamp: string
  unread: number
}

interface ChatListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ChatList({ conversations, selectedId, onSelect }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Messages</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <Edit className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-transparent focus:border-primary/30 transition-all duration-200 outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredConversations.map((conversation) => {
          const isSelected = selectedId === conversation.id
          return (
            <motion.button
              key={conversation.id}
              whileHover={{ x: 4 }}
              onClick={() => onSelect(conversation.id)}
              className={`w-full flex items-center gap-3 p-4 border-b border-border/50 transition-all duration-200 text-left ${
                isSelected
                  ? "bg-primary/10 border-l-2 border-l-primary"
                  : conversation.unread > 0 
                    ? "bg-green-500/5 hover:bg-green-500/10" 
                    : "hover:bg-secondary/30"
              }`}
            >
              <div className="relative flex-shrink-0">
                <Image
                  src={conversation.user.avatar}
                  alt={conversation.user.name}
                  width={48}
                  height={48}
                  unoptimized
                  className="w-12 h-12 rounded-full object-cover"
                />
                {conversation.user.online && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold truncate ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}>
                    {conversation.user.name}
                  </h3>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {conversation.timestamp}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate pr-2 ${conversation.unread > 0 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                    {conversation.lastMessage}
                  </p>
                  {conversation.unread > 0 && (
                    <span className="flex-shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-green-500 text-white text-[10px] font-bold">
                      {conversation.unread > 99 ? '99+' : conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
