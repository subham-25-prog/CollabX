"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { X, Loader2, Camera } from "lucide-react"
import { updateUserProfile } from "@/lib/db"
import { toast } from "sonner"
import { compressImageToBase64 } from "@/lib/image-utils"

interface EditProfileModalProps {
  profile: any
  onClose: () => void
}

export function EditProfileModal({ profile, onClose }: EditProfileModalProps) {
  const [name, setName] = useState(profile.name || "")
  const [role, setRole] = useState(profile.role || "")
  const [bio, setBio] = useState(profile.bio || "")
  const [location, setLocation] = useState(profile.location || "")
  const [skills, setSkills] = useState<string[]>(profile.skills || [])
  const [currentSkill, setCurrentSkill] = useState("")
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar || null)
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.coverImage || null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'coverImage') => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      const maxWidth = type === 'avatar' ? 400 : 1200
      const base64Str = await compressImageToBase64(file, maxWidth)
      
      if (type === 'avatar') {
        setAvatarPreview(base64Str)
      } else {
        setCoverPreview(base64Str)
      }
    } catch (error) {
      console.error("Image processing error", error)
      toast.error("Failed to process image")
    } finally {
      setIsUploadingImage(false)
      e.target.value = '' // Reset input
    }
  }

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newSkills = currentSkill.split(',').map(s => s.trim()).filter(s => s && !skills.includes(s))
      if (newSkills.length > 0) {
        setSkills([...skills, ...newSkills])
      }
      setCurrentSkill("")
    } else if (e.key === 'Backspace' && currentSkill === "" && skills.length > 0) {
      setSkills(skills.slice(0, -1))
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !profile) return
    
    setIsLoading(true)
    try {
      const finalSkills = [...skills]
      const pendingSkill = currentSkill.trim()
      if (pendingSkill && !finalSkills.includes(pendingSkill)) {
        finalSkills.push(pendingSkill)
      }

      const updateData: any = {
        name,
        role,
        bio,
        location,
        skills: finalSkills
      }
      
      if (avatarPreview && avatarPreview.startsWith('data:image')) {
        updateData.avatar = avatarPreview
      }
      if (coverPreview && coverPreview.startsWith('data:image')) {
        updateData.coverImage = coverPreview
      }

      if (role.toLowerCase().includes('admin')) {
        toast.error("Unauthorized role: Admin")
        setIsLoading(false)
        return
      }

      await updateUserProfile(profile.uid, updateData)
      toast.success("Profile updated successfully!")
      onClose()
    } catch (error: any) {
      console.error("Profile update error:", error)
      toast.error(error.message || "Failed to update profile.")
    } finally {
      setIsLoading(false)
    }
  }

  const getFallbackAvatar = () => {
    if (profile.gender === 'Female') return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
    if (profile.gender === 'Male') return "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop"
    return `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name || "fallback"}`
  }

  const getFallbackCover = () => {
    if (profile.gender === 'Female') return "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop"
    if (profile.gender === 'Male') return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop"
    return "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop"
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
        className="w-full max-w-lg bg-background border border-border rounded-2xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border z-10 shrink-0">
          <button onClick={onClose} className="text-foreground hover:opacity-70 transition-opacity">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-base font-bold text-foreground">Edit profile</h2>
          <button 
            onClick={handleSubmit}
            disabled={isLoading || isUploadingImage || !name.trim()}
            className="text-primary font-bold text-base hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Done"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {/* Cover Edit */}
          <div className="relative h-32 w-full group">
            <img 
              src={coverPreview || getFallbackCover()} 
              alt="Cover preview" 
              className="w-full h-full object-cover opacity-80"
            />
            <button 
              onClick={() => coverInputRef.current?.click()}
              className="absolute right-3 top-3 p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors shadow-sm"
            >
              <Camera className="w-4 h-4 text-foreground" />
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={coverInputRef}
              onChange={(e) => handleImageChange(e, 'coverImage')}
            />
          </div>

          {/* Avatar Edit */}
          <div className="flex flex-col items-center -mt-12 mb-6">
            <div className="relative group">
              <img 
                src={avatarPreview || getFallbackAvatar()} 
                alt="Avatar preview" 
                className="w-24 h-24 rounded-full object-cover border-4 border-background bg-secondary"
              />
              <button 
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={avatarInputRef}
                onChange={(e) => handleImageChange(e, 'avatar')}
              />
            </div>
            <button 
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="mt-3 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
            >
              Edit picture or avatar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full py-2 bg-transparent border-b border-border focus:border-primary transition-colors outline-none text-foreground text-base"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full py-2 bg-transparent border-b border-border focus:border-primary transition-colors outline-none text-foreground text-base"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full py-2 bg-transparent border-b border-border focus:border-primary transition-colors outline-none text-foreground text-base"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell us about yourself..."
                className="w-full py-2 bg-transparent border-b border-border focus:border-primary transition-colors outline-none text-foreground text-base resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills</label>
              <div className="w-full min-h-[42px] p-1.5 bg-transparent border-b border-border focus-within:border-primary transition-colors flex flex-wrap gap-2 items-center">
                {skills.map((skill) => (
                  <span 
                    key={skill} 
                    className="flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
                  >
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => removeSkill(skill)}
                      className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val.includes(',')) {
                      const newSkills = val.split(',').map(s => s.trim()).filter(s => s && !skills.includes(s))
                      if (newSkills.length > 0) {
                        setSkills([...skills, ...newSkills])
                      }
                      setCurrentSkill("")
                    } else {
                      setCurrentSkill(val)
                    }
                  }}
                  onKeyDown={handleAddSkill}
                  placeholder={skills.length === 0 ? "Type a skill and press Enter..." : ""}
                  className="flex-1 min-w-[120px] bg-transparent outline-none text-foreground text-sm py-1 px-2"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Press Enter or comma to add a skill.</p>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}
