"use client"

import { motion } from "framer-motion"
import { MapPin, Calendar, Link as LinkIcon, MessageCircle, UserPlus, Edit3, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { toggleFollowUser, createChat, updateUserProfile } from "@/lib/db"
import { toast } from "sonner"
import { AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"

const EditProfileModal = dynamic(() => import("@/components/profile/edit-profile-modal").then(mod => mod.EditProfileModal), { ssr: false })
const InviteProjectModal = dynamic(() => import("@/components/teams/invite-project-modal").then(mod => mod.InviteProjectModal), { ssr: false })

interface ProfileHeaderProps {
  profile: any
  isOwnProfile: boolean
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const router = useRouter()
  const { profile: currentUser } = useAuth()
  const [isMessaging, setIsMessaging] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Determine initial follow state
  useEffect(() => {
    if (currentUser && profile) {
      setIsFollowing((profile.followers || []).includes(currentUser.uid))
    }
  }, [currentUser, profile])

  const handleFollow = async () => {
    if (!currentUser || !profile) return
    setIsFollowLoading(true)
    try {
      await toggleFollowUser(currentUser.uid, profile.uid, isFollowing)
      setIsFollowing(!isFollowing)
      toast.success(isFollowing ? "Unfollowed" : "Followed")
    } catch (error) {
      toast.error("Failed to follow/unfollow")
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleMessage = async () => {
    if (!currentUser || !profile) return
    setIsMessaging(true)
    try {
      // Create a new chat or find existing
      const chatRef = await createChat([currentUser.uid, profile.uid])
      router.push(`/chat?id=${chatRef.id}`)
    } catch (error) {
      console.error(error)
      setIsMessaging(false)
    }
  }
  if (!profile) return null

  const skills = profile.skills || []

  const getAvatarImage = () => {
    if (profile.avatar) return profile.avatar;
    if (profile.gender === 'Female') return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop";
    if (profile.gender === 'Male') return "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop";
    return `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name || "fallback"}`;
  };

  const getCoverImage = () => {
    if (profile.coverImage) return profile.coverImage;
    if (profile.gender === 'Female') return "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&h=400&fit=crop"; // Professional women in tech
    if (profile.gender === 'Male') return "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=400&fit=crop"; // Professional tech team
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop"; // Global tech network
  };

  return (
    <>
    <div className="relative">
      {/* Cover Image */}
      <div className="h-24 sm:h-64 relative overflow-hidden bg-secondary group">
        <Image
          src={getCoverImage()}
          alt="Cover"
          fill
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="relative -mt-12 sm:-mt-24 flex items-center justify-between gap-4">
          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative inline-block group"
          >
            <Image
              src={getAvatarImage()}
              alt={profile.name}
              width={160}
              height={160}
              unoptimized
              className="w-24 h-24 sm:w-40 sm:h-40 rounded-full sm:rounded-2xl object-cover border-4 border-background shadow-xl bg-background"
            />
            <span className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-4 border-background" />
          </motion.div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto pt-12 sm:pt-24">
            {isOwnProfile && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold transition-colors text-sm sm:text-base border border-border"
                  onClick={() => setShowEditModal(true)}
                >
                  Edit Profile
                </motion.button>
                <Link href="/settings" className="p-1.5 sm:p-2 rounded-xl bg-transparent hover:bg-secondary text-foreground transition-colors">
                  <Settings className="w-6 h-6 sm:w-6 sm:h-6" />
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 sm:flex sm:items-start sm:justify-between">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{profile.name}</h1>
                <p className="text-muted-foreground mt-1">@{profile.name.toLowerCase().replace(/\s/g, '')}</p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-3 text-foreground max-w-xl leading-relaxed"
              >
                {profile.bio || "No bio yet."}
              </motion.p>

              {/* Meta info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {profile.location || "Earth"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Joined Recently
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                  {profile.role || "Student"}
                </span>
              </motion.div>

              {/* Skills */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="flex flex-wrap gap-2 mt-4"
              >
                {skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="flex items-center gap-6 mt-6"
              >
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">{(profile.projects || []).length}</p>
                  <p className="text-sm text-muted-foreground">Projects</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">{(profile.teams || []).length}</p>
                  <p className="text-sm text-muted-foreground">Teams</p>
                </div>
              </motion.div>
            </div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center gap-3 mt-6 sm:mt-0"
            >
              {!isOwnProfile && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMessage}
                    disabled={isMessaging}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {isMessaging ? "Starting..." : "Message"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Invite
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 ${
                      isFollowing 
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                        : "border border-primary text-primary hover:bg-primary/10"
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    {isFollowing ? "Unfollow" : "Follow"}
                  </motion.button>
                </>
              )}
            </motion.div>
          </div>
          </div>
        </div>
      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal profile={profile} onClose={() => setShowEditModal(false)} />
        )}
        {showInviteModal && (
          <InviteProjectModal targetUser={{ id: profile.uid, name: profile.name }} onClose={() => setShowInviteModal(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
