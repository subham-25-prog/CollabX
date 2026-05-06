"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, UserPlus, MessageCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createChat, toggleFollowUser } from "@/lib/db"
import { useAuth } from "@/components/auth/auth-provider"
import { checkIsAdmin, MASTER_ADMIN_EMAIL } from "@/lib/admin"
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

interface UserCardProps {
  user: {
    uid: string // Using uid from Firestore
    name: string
    avatar: string
    role: string
    bio: string
    skills: string[]
    availability: string
    location: string
    email?: string
  }
}

const availabilityColors: Record<string, string> = {
  Available: "bg-green-500/20 text-green-400 border-green-500/30",
  "Part-time": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Busy: "bg-red-500/20 text-red-400 border-red-500/30",
}

import { Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export function UserCard({ user }: UserCardProps) {
  const router = useRouter()
  const { profile: currentUser } = useAuth()
  const [isMessaging, setIsMessaging] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const isFollowing = ((currentUser as any)?.following || []).includes(user.uid)
  const isMasterAdmin = currentUser?.email === MASTER_ADMIN_EMAIL
  const targetIsAdmin = user.email === MASTER_ADMIN_EMAIL

  const handleFollow = async () => {
    if (!currentUser || !user.uid) return
    setIsFollowLoading(true)
    try {
      await toggleFollowUser(currentUser.uid, user.uid, isFollowing)
      // Note: We don't need a local state for following because it will update when `profile` refetches
    } catch (error) {
      console.error(error)
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleMessage = async () => {
    if (!currentUser || !user.uid) return
    setIsMessaging(true)
    try {
      const chatRef = await createChat([currentUser.uid, user.uid])
      router.push(`/chat?id=${chatRef.id}`)
    } catch (error) {
      console.error(error)
      setIsMessaging(false)
    }
  }

  // Fallback for availability
  const availabilityStatus = user.availability || "Available"
  const availabilityClass = availabilityColors[availabilityStatus] || availabilityColors["Available"]

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass rounded-xl p-3 sm:p-4 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full"
    >
      {/* Header with avatar and info */}
      <div className="flex items-center sm:items-start gap-3 sm:mb-3">
        <Link href={`/profile?id=${user.uid}`} className="shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <Image
              src={user.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=fallback"}
              alt={user.name}
              width={40}
              height={40}
              unoptimized
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover ring-1 ring-transparent hover:ring-primary/30 transition-all bg-secondary"
            />
          </motion.div>
        </Link>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-2">
            <Link href={`/profile?id=${user.uid}`} className="truncate">
              <h3 className="text-sm sm:text-base font-semibold text-foreground hover:text-primary transition-colors truncate">
                {user.name}
              </h3>
            </Link>
            <span
              className={`hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-medium border shrink-0 ${availabilityClass}`}
            >
              {availabilityStatus}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.role}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{user.location || "Earth"}</span>
            </div>
            {targetIsAdmin && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[8px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-2.5 h-2.5" />
                Admin
              </div>
            )}
          </div>
        </div>

        {/* Mobile Actions (Hidden on Desktop) */}
        <div className="sm:hidden flex items-center gap-1.5 shrink-0">
          {currentUser?.uid !== user.uid ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleFollow}
              disabled={isFollowLoading}
              className={`p-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                isFollowing 
                  ? "bg-secondary text-secondary-foreground" 
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {isFollowLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            </motion.button>
          ) : null}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleMessage}
            disabled={isMessaging || currentUser?.uid === user.uid}
            className="p-2 rounded-lg bg-secondary text-secondary-foreground transition-colors disabled:opacity-50"
          >
            {isMessaging ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Desktop Only Content */}
      <div className="hidden sm:flex flex-col flex-1">
        {/* Bio */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2 flex-1">
          {user.bio || "No bio provided."}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mb-3 min-h-[24px]">
          {(user.skills || []).slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md bg-secondary/50 text-secondary-foreground text-[10px] font-medium"
            >
              {skill}
            </span>
          ))}
          {(user.skills || []).length > 3 && (
            <span className="px-2 py-0.5 rounded-md bg-secondary/50 text-muted-foreground text-[10px] font-medium">
              +{(user.skills || []).length - 3}
            </span>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="flex items-center gap-2 mt-auto">
          {currentUser?.uid !== user.uid ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFollow}
              disabled={isFollowLoading}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                isFollowing 
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                  : "gradient-primary text-primary-foreground shadow-sm shadow-primary/20"
              }`}
            >
              {isFollowLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
              {isFollowing ? "Following" : "Follow"}
            </motion.button>
          ) : (
            <div className="flex-1 py-2 rounded-lg bg-secondary text-secondary-foreground text-center text-xs font-medium">
              You
            </div>
          )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMessage}
              disabled={isMessaging || currentUser?.uid === user.uid}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors disabled:opacity-50"
            >
              {isMessaging ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
            </motion.button>
          </div>
      </div>
    </motion.div>
  )
}
