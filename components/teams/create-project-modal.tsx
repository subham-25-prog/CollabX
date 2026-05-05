"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Loader2, Upload, Image as ImageIcon, ChevronDown } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { createProject } from "@/lib/db"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { toast } from "sonner"

interface CreateProjectModalProps {
  onClose: () => void
  projectType?: 'project' | 'startup'
}

export function CreateProjectModal({ onClose, projectType: initialProjectType = 'project' }: CreateProjectModalProps) {
  const { profile } = useAuth()
  const [currentProjectType, setCurrentProjectType] = useState<string>(initialProjectType)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [skills, setSkills] = useState("")
  
  // New fields
  const [membersNeeded, setMembersNeeded] = useState("")
  const [duration, setDuration] = useState("")
  const [phase, setPhase] = useState("")
  const [commitment, setCommitment] = useState("")
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !profile) return
    
    const skillsArray = skills.split(",").map(s => s.trim()).filter(s => s.length > 0)
    
    setIsLoading(true)
    try {
      let imageUrl = null
      if (imageFile) {
        const imageRef = ref(storage, `projects/${profile.uid}_${Date.now()}`)
        await uploadBytes(imageRef, imageFile)
        imageUrl = await getDownloadURL(imageRef)
      }

      await createProject(
        { id: profile.uid, name: profile.name, avatar: profile.avatar || "" },
        title,
        description,
        skillsArray,
        imageUrl,
        currentProjectType,
        membersNeeded,
        duration,
        phase,
        commitment
      )
      toast.success(currentProjectType === 'startup' ? "Startup idea posted!" : "Project created successfully!")
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to create project")
    } finally {
      setIsLoading(false)
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
        className="w-full max-w-lg glass rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold text-foreground">
            {currentProjectType === 'startup' ? 'Post Startup Idea' : 'Post Project Requirement'}
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <form id="create-project-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Post Type</label>
              <div className="relative">
                <select
                  value={currentProjectType}
                  onChange={(e) => setCurrentProjectType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground appearance-none cursor-pointer"
                >
                  <option value="project">Project Requirement</option>
                  <option value="startup">Startup Idea</option>
                  <option value="college">College Project</option>
                  <option value="research">Research Collaboration</option>
                  <option value="hackathon">Competition/Hackathon</option>
                  <option value="open-source">Open Source</option>
                  <option value="study">Study Group</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={currentProjectType === 'startup' ? "e.g. A new AI-powered study buddy" : "e.g. Mobile App for Campus Navigation"}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project and what kind of teammates you're looking for..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Members Needed</label>
                <input
                  type="text"
                  value={membersNeeded}
                  onChange={(e) => setMembersNeeded(e.target.value)}
                  placeholder="e.g. 2 developers, 1 designer"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Expected Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 3 months, Ongoing"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Project Phase</label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground appearance-none"
                >
                  <option value="">Select phase...</option>
                  <option value="Idea Phase">Idea Phase</option>
                  <option value="Planning">Planning</option>
                  <option value="Prototyping">Prototyping</option>
                  <option value="In Development">In Development</option>
                  <option value="Near Completion">Near Completion</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Time Commitment</label>
                <input
                  type="text"
                  value={commitment}
                  onChange={(e) => setCommitment(e.target.value)}
                  placeholder="e.g. 10 hrs/week"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Required Skills (Comma separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React Native, Firebase, UI/UX Design"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Project Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setImageFile(file)
                    setImagePreview(URL.createObjectURL(file))
                  }
                }}
                className="hidden"
                id="project-image-upload"
              />
              <label
                htmlFor="project-image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/50 hover:border-primary/50 transition-all overflow-hidden relative"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : imageFile ? (
                  <span className="text-sm text-primary truncate max-w-[90%] px-2">{imageFile.name}</span>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground text-center px-1">Upload Image</span>
                  </div>
                )}
              </label>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-border shrink-0 flex justify-end gap-3 bg-background/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-project-form"
            disabled={isLoading || !title.trim() || !description.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
