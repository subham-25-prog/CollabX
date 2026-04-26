"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, Paperclip, Smile, Phone, Video, MoreVertical } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "me" | "them"
  timestamp: string
}

interface ChatWindowProps {
  conversation: {
    user: {
      name: string
      avatar: string
      online: boolean
    }
  }
  messages: Message[]
}

export function ChatWindow({ conversation, messages }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!newMessage.trim()) return
    // In a real app, this would send the message
    setNewMessage("")
    
    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 2000)
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header - Desktop only */}
      <div className="hidden lg:flex items-center justify-between p-4 border-b border-border glass-strong">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={conversation.user.avatar}
              alt={conversation.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {conversation.user.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{conversation.user.name}</h3>
            <p className="text-xs text-muted-foreground">
              {conversation.user.online ? "Active now" : "Offline"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <Phone className="w-5 h-5 text-muted-foreground" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <Video className="w-5 h-5 text-muted-foreground" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-3 ${
                message.sender === "me"
                  ? "gradient-primary text-primary-foreground rounded-br-md"
                  : "glass rounded-bl-md"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {message.timestamp}
              </p>
            </div>
          </motion.div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex justify-start"
          >
            <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1">
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 rounded-full bg-muted-foreground"
                />
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 rounded-full bg-muted-foreground"
                />
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 rounded-full bg-muted-foreground"
                />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border glass-strong">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </motion.button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-primary/30 transition-all duration-200 outline-none placeholder:text-muted-foreground pr-12"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <Smile className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-3 rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
