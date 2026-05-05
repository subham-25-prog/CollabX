"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, MoreVertical, Send, Paperclip, Smile, Image as ImageIcon, Loader2, X, ArrowLeft, User, Ban, Trash2, BellOff, Flag, Check, CheckCheck } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { collection, query, orderBy, onSnapshot, serverTimestamp, addDoc, doc, updateDoc } from "firebase/firestore"
import { db, storage } from "@/lib/firebase"
import { ref, uploadBytes, uploadString, getDownloadURL } from "firebase/storage"
import { toast } from "sonner"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import Link from "next/link"
import Image from "next/image"
import { muteChat, reportUser, blockUser, deleteChat, setTypingStatus, createNotification } from "@/lib/db"
import { useRouter } from "next/navigation"
import { compressImageToBase64 } from "@/lib/image-utils"

interface ChatWindowProps {
  conversation: {
    id: string
    user: {
      id: string
      name: string
      avatar: string
      online: boolean
      isGroup?: boolean
    }
  }
  chatId: string
  onBack?: () => void
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getStringColor = (str: string) => {
  const colors = ["text-red-400", "text-blue-400", "text-green-400", "text-yellow-400", "text-purple-400", "text-pink-400"]
  return colors[str.length % colors.length]
}

const COMMON_EMOJIS = ["😀","😂","😍","🙏","👍","🔥","❤️","✨","😢","😎","🤔","🙌"]

export function ChatWindow({ conversation, chatId, onBack }: ChatWindowProps) {
  const { profile: currentUser } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<any[]>([])
  const [sendingMessages, setSendingMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
  const [attachmentType, setAttachmentType] = useState<'image' | 'video' | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Listen for typing status
  useEffect(() => {
    if (!chatId) return
    const unsubscribe = onSnapshot(doc(db, "chats", chatId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        const typing = data.typing || {}
        const othersTyping = Object.keys(typing).filter(uid => uid !== currentUser?.uid && typing[uid] === true)
        setTypingUsers(othersTyping)
      }
    })
    return () => unsubscribe()
  }, [chatId, currentUser])

  // Update my typing status
  useEffect(() => {
    if (!chatId || !currentUser) return
    
    const setStatus = (status: boolean) => {
      setTypingStatus(chatId, currentUser.uid, status).catch(() => {})
    }

    if (newMessage.trim()) {
      setStatus(true)
      const timeout = setTimeout(() => setStatus(false), 3000)
      return () => clearTimeout(timeout)
    } else {
      setStatus(false)
    }
  }, [newMessage, chatId, currentUser])

  const isMutualFollower = currentUser?.following?.includes(conversation.user.id) && currentUser?.followers?.includes(conversation.user.id)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!chatId) return

    setIsLoading(true)
    const messagesRef = collection(db, "chats", chatId, "messages")
    const q = query(messagesRef, orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sender: doc.data().senderId === currentUser?.uid ? "me" : "them",
        timestampFormatted: doc.data().timestamp?.toDate 
          ? formatTime(doc.data().timestamp.toDate()) 
          : "Just now"
      }))
      setMessages(messagesData)
      setIsLoading(false)
      setTimeout(scrollToBottom, 100)
    })

    return () => unsubscribe()
  }, [chatId, currentUser])

  useEffect(() => {
    scrollToBottom()
    
    // Mark incoming messages as read
    if (!chatId || !currentUser || messages.length === 0) return
    const unreadMessages = messages.filter(m => m.sender !== "me" && !m.read)
    if (unreadMessages.length > 0) {
      unreadMessages.forEach(async (m) => {
        try {
          const msgRef = doc(db, "chats", chatId, "messages", m.id)
          await updateDoc(msgRef, { read: true })
        } catch (error) {
          console.error("Failed to mark read:", error)
        }
      })
    }
  }, [messages, chatId, currentUser])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if ((!newMessage.trim() && !attachment) || !currentUser || !chatId) return

    const messageText = newMessage
    const currentAttachment = attachment
    const previewUrl = attachmentPreview
    const type = attachmentType
    
    setNewMessage("") 
    setAttachment(null)
    setAttachmentPreview(null)
    setAttachmentType(null)

    const tempId = `temp_${Date.now()}`
    const tempMessage = {
      id: tempId,
      content: messageText,
      imageUrl: previewUrl,
      mediaType: type,
      senderId: currentUser.uid,
      senderName: currentUser.name || "User",
      senderAvatar: currentUser.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=fallback",
      sender: "me",
      timestampFormatted: "Sending...",
      isSending: true
    }

    setSendingMessages(prev => [...prev, tempMessage])
    setTimeout(scrollToBottom, 100)

    try {
      let imageUrl = null
      if (currentAttachment) {
        if (currentAttachment.type.startsWith('image/')) {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: false
          }
          const compressedFile = await compressImageToBase64(currentAttachment, 1920)
          
          // ImgBB API supports base64 directly (without data:image/jpeg;base64,)
          const base64Data = compressedFile.split(',')[1]
          const formData = new FormData()
          formData.append("image", base64Data)
          
          const response = await fetch("https://api.imgbb.com/1/upload?key=6e38ec9c63ca880872d00fe6e4be0417", {
            method: "POST",
            body: formData
          })
          const data = await response.json()
          if (data.success) {
            imageUrl = data.data.url
          } else {
            throw new Error("Failed to upload image")
          }
        } else {
          toast.error("Video uploads are not supported on the free plan.")
          setSendingMessages(prev => prev.filter(m => m.id !== tempId))
          return
        }
      }

      const messagesRef = collection(db, "chats", chatId, "messages")
      await addDoc(messagesRef, {
        content: messageText,
        imageUrl: imageUrl,
        mediaType: currentAttachment?.type.startsWith('video/') ? 'video' : (imageUrl ? 'image' : null),
        senderId: currentUser.uid,
        senderName: currentUser.name || "User",
        senderAvatar: currentUser.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=fallback",
        timestamp: serverTimestamp()
      })

      const chatRef = doc(db, "chats", chatId)
      await updateDoc(chatRef, {
        lastMessage: imageUrl ? (messageText ? `[Media] ${messageText}` : 'Sent media') : messageText,
        updatedAt: serverTimestamp()
      })

      // Trigger notification for the other participants
      try {
        if (chatId) {
          const chatSnap = await getDoc(chatRef)
          if (chatSnap.exists()) {
            const participants = chatSnap.data().participants || []
            for (const p of participants) {
              if (p !== currentUser.uid) {
                await createNotification(p, {
                  type: 'message',
                  title: 'New Message from ' + (currentUser.name || 'Student'),
                  message: imageUrl ? 'Sent an attachment' : messageText,
                  link: `/chat?id=${chatId}`,
                  senderId: currentUser.uid
                }).catch(e => console.error("Failed to notify participant:", e))
              }
            }
          }
        }
      } catch (notifyError) {
        console.error("Failed to process notifications, but message was sent.", notifyError)
      }
    } catch (error) {
      console.error("Failed to send message", error)
      toast.error("Message failed to send. Please check your connection.")
    } finally {
      setIsSending(false)
      setSendingMessages(prev => prev.filter(m => m.id !== tempId))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const isVideo = file.type.startsWith('video/')
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error(`${isVideo ? 'Video' : 'Image'} must be smaller than ${isVideo ? '50MB' : '5MB'}`)
        return
      }
      setAttachment(file)
      setAttachmentPreview(URL.createObjectURL(file))
      setAttachmentType(isVideo ? 'video' : 'image')
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background/50 overflow-hidden relative">
      <div className="sticky top-0 z-20 flex items-center justify-between p-3 glass-strong border-b border-border shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {onBack && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="lg:hidden p-2 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          )}
          <Link href={`/profile?id=${conversation.user.id}`} className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <Image
                src={conversation.user.avatar}
                alt={conversation.user.name}
                width={40}
                height={40}
                unoptimized
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground leading-tight hover:underline">
                {conversation.user.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {conversation.user.isGroup ? (
                  typingUsers.length > 0 ? "Someone is typing..." : "Group Chat"
                ) : (
                  typingUsers.length > 0 ? "typing..." : (conversation.user.online ? "online" : "offline")
                )}
              </p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          {!conversation.user.isGroup && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (!isMutualFollower) {
                  toast.error("You can only call mutual followers.")
                } else {
                  toast.success("Calling " + conversation.user.name + "...")
                }
              }}
              className={`p-2.5 rounded-xl transition-colors ${isMutualFollower ? 'hover:bg-secondary/50' : 'opacity-50 cursor-not-allowed'}`}
            >
              <Phone className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          )}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors outline-none"
              >
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" className="glass rounded-xl p-1 min-w-[180px] shadow-xl z-50 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                <DropdownMenu.Item asChild>
                  <Link href={`/profile?id=${conversation.user.id}`} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg outline-none cursor-pointer hover:bg-secondary/80 focus:bg-secondary/80 text-foreground">
                    <User className="w-4 h-4" /> View Profile
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg outline-none cursor-pointer hover:bg-secondary/80 focus:bg-secondary/80 text-foreground"
                  onClick={async () => {
                    if (currentUser) {
                      await muteChat(currentUser.uid, chatId)
                      toast.success("Chat muted")
                    }
                  }}
                >
                  <BellOff className="w-4 h-4" /> Mute Messages
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-border my-1" />
                <DropdownMenu.Item 
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg outline-none cursor-pointer hover:bg-secondary/80 focus:bg-secondary/80 text-foreground"
                  onClick={async () => {
                    if (currentUser) {
                      await reportUser(currentUser.uid, conversation.user.id)
                      toast.success("User reported")
                    }
                  }}
                >
                  <Flag className="w-4 h-4" /> Report
                </DropdownMenu.Item>
                {!conversation.user.isGroup && (
                  <DropdownMenu.Item 
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg outline-none cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 text-destructive"
                    onClick={async () => {
                      if (currentUser) {
                        if (confirm("Are you sure you want to block this user?")) {
                          await blockUser(currentUser.uid, conversation.user.id)
                          toast.success("User blocked")
                          router.push("/chat")
                        }
                      }
                    }}
                  >
                    <Ban className="w-4 h-4" /> Block User
                  </DropdownMenu.Item>
                )}
                <DropdownMenu.Item 
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg outline-none cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 text-destructive"
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this chat completely?")) {
                      await deleteChat(chatId)
                      toast.success("Chat deleted")
                      router.push("/chat")
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" /> Delete Chat
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide relative">
        {isLoading && (
          <div className="absolute inset-0 flex justify-center items-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        <AnimatePresence initial={false}>
          {[...messages, ...sendingMessages].map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              {message.sender !== "me" && conversation.user.isGroup && message.senderAvatar && (
                <Link href={`/profile?id=${message.senderId}`} className="mr-2 flex flex-col items-center flex-shrink-0 mt-1 hover:opacity-80 transition-opacity">
                  <Image width={32} height={32} unoptimized src={message.senderAvatar} alt={message.senderName} className="w-8 h-8 rounded-full object-cover" title={message.senderName} />
                </Link>
              )}
              <div
                className={`relative max-w-[85%] sm:max-w-[75%] shadow-sm text-[15px] break-words overflow-hidden ${
                  (!message.content && message.imageUrl) ? "p-1 pb-5" : "px-4 py-3"
                } ${
                  message.sender === "me"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 rounded-2xl rounded-br-md ml-auto"
                    : "glass rounded-2xl rounded-bl-md mr-auto"
                } ${message.isSending ? 'opacity-70' : ''}`}
              >

                {message.sender !== "me" && conversation.user.isGroup && message.senderName && (
                  <p className={`text-xs font-bold ${(!message.content && message.imageUrl) ? 'px-2 pt-1 mb-1' : 'mb-1'} ${getStringColor(message.senderName)}`}>{message.senderName}</p>
                )}
                {message.imageUrl && (
                  message.mediaType === 'video' ? (
                    <video 
                      src={message.imageUrl} 
                      controls
                      className={`w-full max-w-sm rounded-[12px] object-cover bg-black/10 ${message.content ? 'mb-2' : ''}`} 
                    />
                  ) : (
                    <img 
                      src={message.imageUrl} 
                      alt="Attachment" 
                      className={`w-full max-w-sm rounded-[12px] object-cover ${message.content ? 'mb-2' : ''}`} 
                    />
                  )
                )}
                {message.content && (
                  <p className="leading-relaxed whitespace-pre-wrap break-all pr-10 pb-1 text-sm">{message.content}</p>
                )}
                <div
                  className={`absolute bottom-1 right-2 flex items-center gap-1 text-[10px] ${
                    message.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  <span>{message.timestampFormatted}</span>
                  {message.sender === "me" && (
                    message.isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 
                    message.read ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> :
                    conversation.user.online ? <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" /> :
                    <Check className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border glass-strong flex flex-col gap-2 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <AnimatePresence>
          {attachmentPreview && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative self-start inline-block"
            >
              {attachmentType === 'video' ? (
                <video src={attachmentPreview} className="h-20 w-auto rounded-xl border border-border object-cover bg-black/5" />
              ) : (
                <img src={attachmentPreview} alt="Preview" className="h-20 w-auto rounded-xl border border-border object-cover" />
              )}
              <button 
                onClick={() => {
                  setAttachment(null)
                  setAttachmentPreview(null)
                  setAttachmentType(null)
                }}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/80"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            accept="image/*,video/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          <div className="flex-1 relative flex items-center bg-secondary/50 rounded-xl px-2">
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
              className="p-2"
            >
              <Smile className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
            <input
              type="text"
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-transparent py-3 px-2 outline-none text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2"
            >
              <Paperclip className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>

            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-4 bg-background border border-border rounded-xl shadow-xl p-2 grid grid-cols-4 gap-1 z-50"
                >
                  {COMMON_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setNewMessage(prev => prev + emoji)
                        setShowEmojiPicker(false)
                      }}
                      className="text-2xl hover:bg-secondary rounded-lg p-2 transition-colors flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={(!newMessage.trim() && !attachment)}
            className="p-3 rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[48px]"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

