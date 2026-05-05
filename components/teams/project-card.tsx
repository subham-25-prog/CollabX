"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Code, Calendar, ChevronDown, CheckCircle2, XCircle, Trash2, MessageSquare, Clock, Activity } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { applyToProject, acceptApplicant, rejectApplicant, acceptProjectInvite, toggleProjectStatus, deleteProject } from "@/lib/db"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { useNotifications } from "@/hooks/use-notifications"

interface ProjectCardProps {
  project: any
  allUsers?: any[]
}

export function ProjectCard({ project, allUsers = [] }: ProjectCardProps) {
  const { profile } = useAuth()
  const { notifications } = useNotifications()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [isManaging, setIsManaging] = useState(false)

  const hasUnreadChat = project.chatId && notifications.some(
    n => !n.read && n.type === 'message' && n.link?.includes(`id=${project.chatId}`)
  )

  const isOwner = profile?.uid === project.owner.id
  const isMember = project.members?.includes(profile?.uid)
  const hasApplied = project.applicants?.includes(profile?.uid)
  const hasBeenInvited = project.invites?.includes(profile?.uid)

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!profile) {
      toast.error("Please complete your profile to apply.")
      return
    }
    
    setIsApplying(true)
    try {
      await applyToProject(project.id, profile.uid)
      toast.success("Application submitted successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to apply")
    } finally {
      setIsApplying(false)
    }
  }

  const handleApplicant = async (applicantId: string, action: 'accept' | 'reject') => {
    setIsManaging(true)
    try {
      if (action === 'accept') {
        await acceptApplicant(project.id, applicantId)
        toast.success("Applicant accepted!")
      } else {
        await rejectApplicant(project.id, applicantId)
        toast.success("Applicant rejected.")
      }
    } catch (error: any) {
      toast.error("Action failed")
    } finally {
      setIsManaging(false)
    }
  }

  const handleAcceptInvite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!profile) return
    
    setIsApplying(true)
    try {
      await acceptProjectInvite(project.id, profile.uid)
      toast.success("Joined project successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to accept invite")
    } finally {
      setIsApplying(false)
    }
  }

  const handleStatusToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!profile || !isOwner) return
    setIsManaging(true)
    try {
      const newStatus = project.status === 'closed' ? 'open' : 'closed'
      await toggleProjectStatus(project.id, newStatus)
      toast.success(`Project ${newStatus === 'open' ? 'opened for' : 'closed to'} new applications.`)
    } catch (error: any) {
      toast.error("Failed to change project status")
    } finally {
      setIsManaging(false)
    }
  }

  const timeAgo = project.createdAt?.toDate 
    ? new Date(project.createdAt.toDate()).toLocaleDateString()
    : "Recently"

  return (
    <motion.div
      layout
      className="glass rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border border-border/50"
    >
      <div className="p-5 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">{project.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {timeAgo}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {project.members.length} members</span>
            </div>
          </div>
          <Link href={`/profile?id=${project.owner.id}`} onClick={e => e.stopPropagation()}>
            <Image
              src={project.owner.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=fallback"}
              alt={project.owner.name}
              width={40}
              height={40}
              unoptimized
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 bg-secondary"
              title={`Owner: ${project.owner.name}`}
            />
          </Link>
        </div>

        <p className={`text-muted-foreground text-sm mb-4 ${!isExpanded && "line-clamp-2"}`}>
          {project.description}
        </p>

        {(project.membersNeeded || project.duration || project.phase || project.commitment) && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {project.membersNeeded && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border">
                <Users className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Needed</p>
                  <p className="text-xs font-medium text-foreground truncate">{project.membersNeeded}</p>
                </div>
              </div>
            )}
            {project.duration && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Duration</p>
                  <p className="text-xs font-medium text-foreground truncate">{project.duration}</p>
                </div>
              </div>
            )}
            {project.phase && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border">
                <Activity className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Phase</p>
                  <p className="text-xs font-medium text-foreground truncate">{project.phase}</p>
                </div>
              </div>
            )}
            {project.commitment && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Commitment</p>
                  <p className="text-xs font-medium text-foreground truncate">{project.commitment}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {(project.skills || []).slice(0, isExpanded ? undefined : 3).map((skill: string) => (
            <span key={skill} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              {skill}
            </span>
          ))}
          {!isExpanded && (project.skills?.length || 0) > 3 && (
            <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              +{(project.skills.length - 3)} more
            </span>
          )}
        </div>

        {project.imageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden bg-secondary relative h-48 w-full">
            <Image src={project.imageUrl} alt={project.title} fill unoptimized className="object-cover" />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
          <div className="flex -space-x-2">
            {project.members.slice(0, 5).map((memberId: string) => {
              const memberProfile = allUsers.find(u => u.id === memberId || u.uid === memberId) || project.owner
              return (
                <Link key={memberId} href={`/profile?id=${memberId}`} onClick={e => e.stopPropagation()}>
                  <Image
                    src={memberProfile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${memberId}`}
                    alt={memberProfile.name || "Member"}
                    width={32}
                    height={32}
                    unoptimized
                    className="w-8 h-8 rounded-full object-cover border-2 border-background bg-secondary"
                    title={memberProfile.name}
                  />
                </Link>
              )
            })}
            {project.members.length > 5 && (
              <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground z-10">
                +{project.members.length - 5}
              </div>
            )}
          </div>

          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
            {!isOwner && !isMember && !hasApplied && !hasBeenInvited && project.status !== 'closed' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApply}
                disabled={isApplying}
                className="px-4 py-1.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {isApplying ? "Applying..." : "Apply to Join"}
              </motion.button>
            )}

            {!isOwner && !isMember && !hasApplied && !hasBeenInvited && project.status === 'closed' && (
               <span className="px-4 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-medium flex items-center gap-1">
                 <XCircle className="w-4 h-4" /> Team Full
               </span>
            )}

            {!isOwner && !isMember && hasBeenInvited && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAcceptInvite}
                disabled={isApplying}
                className="px-4 py-1.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {isApplying ? "Accepting..." : "Accept Invite"}
              </motion.button>
            )}
            
            {!isOwner && !isMember && hasApplied && (
              <span className="px-4 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
                Pending
              </span>
            )}

            {!isOwner && isMember && (
              <div className="flex gap-2 items-center">
                <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-500 text-sm font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Member
                </span>
                {project.chatId && (
                  <Link href={`/chat?id=${project.chatId}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative px-4 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <MessageSquare className="w-4 h-4" /> Message
                      {hasUnreadChat && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-background shadow-sm animate-pulse" />
                      )}
                    </motion.button>
                  </Link>
                )}
              </div>
            )}

            {isOwner && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (confirm("Are you sure you want to delete this project?")) {
                      setIsManaging(true)
                      try {
                        await deleteProject(project.id)
                        toast.success("Project deleted successfully")
                      } catch (err) {
                        toast.error("Failed to delete project")
                        setIsManaging(false)
                      }
                    }
                  }}
                  disabled={isManaging}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStatusToggle}
                  disabled={isManaging}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${project.status === 'closed' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                >
                  {isManaging ? "..." : project.status === 'closed' ? "Open" : "Close"}
                </motion.button>
                {project.chatId && (
                  <Link href={`/chat?id=${project.chatId}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <MessageSquare className="w-4 h-4" /> Message
                      {hasUnreadChat && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-background shadow-sm animate-pulse" />
                      )}
                    </motion.button>
                  </Link>
                )}
                {!project.chatId && (
                  <span className="px-4 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-medium">
                    Your Project
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && isOwner && project.applicants.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5 border-t border-border bg-secondary/10"
          >
            <h4 className="text-sm font-semibold text-foreground my-3">Applicants ({project.applicants.length})</h4>
            <div className="space-y-2">
              {project.applicants.map((appId: string) => {
                const applicantProfile = allUsers.find(u => u.id === appId || u.uid === appId)
                
                return (
                  <div key={appId} className="flex justify-between items-center p-2 rounded-lg bg-background border border-border">
                    <Link href={`/profile?id=${appId}`} className="flex items-center gap-3 flex-1 group">
                      <Image 
                        src={applicantProfile?.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=fallback"} 
                        alt={applicantProfile?.name || "Applicant"} 
                        width={32}
                        height={32}
                        unoptimized
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/20"
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors font-medium">
                        {applicantProfile?.name || `User: ${appId.slice(0, 8)}`}
                      </span>
                    </Link>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApplicant(appId, 'accept')}
                        disabled={isManaging}
                        title="Accept Applicant"
                        className="p-1.5 text-green-500 bg-green-500/10 hover:bg-green-500/20 hover:scale-110 rounded-md transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleApplicant(appId, 'reject')}
                        disabled={isManaging}
                        title="Reject Applicant"
                        className="p-1.5 text-red-500 bg-red-500/10 hover:bg-red-500/20 hover:scale-110 rounded-md transition-all shadow-sm"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
