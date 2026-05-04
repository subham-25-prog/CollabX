"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Loader2, FolderKanban } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { collection, query, where, getDocs } from "firebase/firestore"
import { inviteUserToProject } from "@/lib/db"
import { db } from "@/lib/firebase"
import { toast } from "sonner"

interface InviteProjectModalProps {
  targetUser: { id: string, name: string }
  onClose: () => void
}

export function InviteProjectModal({ targetUser, onClose }: InviteProjectModalProps) {
  const { profile } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInviting, setIsInviting] = useState<string | null>(null)

  useEffect(() => {
    const fetchMyProjects = async () => {
      if (!profile) return
      try {
        const q = query(
          collection(db, "projects"),
          where("owner.id", "==", profile.uid)
        )
        const snapshot = await getDocs(q)
        const myProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setProjects(myProjects)
      } catch (error) {
        console.error("Failed to fetch projects", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyProjects()
  }, [profile])

  const handleInvite = async (project: any) => {
    if (!profile) return
    setIsInviting(project.id)
    try {
      await inviteUserToProject(project.id, targetUser.id, profile.name, project.title, profile.uid)
      toast.success(`Invited ${targetUser.name} to ${project.title}`)
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to invite user")
      setIsInviting(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md glass rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Invite to Project</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-sm text-muted-foreground mb-4">
            Select a project to invite <span className="font-semibold text-foreground">{targetUser.name}</span> to:
          </p>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You don't have any active projects.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => {
                const isAlreadyMember = project.members?.includes(targetUser.id)
                const isAlreadyInvited = project.invites?.includes(targetUser.id)
                
                return (
                  <div key={project.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FolderKanban className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{project.title}</h4>
                        <p className="text-xs text-muted-foreground">{project.members?.length || 1} members</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInvite(project)}
                      disabled={isInviting !== null || isAlreadyMember || isAlreadyInvited}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isAlreadyMember || isAlreadyInvited
                          ? "bg-secondary text-muted-foreground cursor-not-allowed"
                          : "gradient-primary text-primary-foreground shadow-sm shadow-primary/20 hover:opacity-90"
                      }`}
                    >
                      {isInviting === project.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isAlreadyMember ? (
                        "Member"
                      ) : isAlreadyInvited ? (
                        "Invited"
                      ) : (
                        "Invite"
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
