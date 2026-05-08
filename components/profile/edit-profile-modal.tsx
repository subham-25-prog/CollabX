"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { X, Loader2, Camera } from "lucide-react"
import { updateUserProfile } from "@/lib/db"
import { toast } from "sonner"
import { compressImageToBase64 } from "@/lib/image-utils"
import { cn } from "@/lib/utils"

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
  
  const [college, setCollege] = useState(profile.college || "")
  const [year, setYear] = useState(profile.year || "")
  const [dept, setDept] = useState(profile.dept || "")
  
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
        skills: finalSkills,
        college,
        year,
        dept
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
        className="w-full max-w-lg glass-strong border border-white/10 rounded-3xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 glass-strong border-b border-white/5 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </motion.button>
            <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={isLoading || isUploadingImage || !name.trim()}
            className="px-6 py-2 rounded-full gradient-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </motion.button>
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

          <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-6">
            <div className="space-y-2 group">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-secondary/30 glass border border-transparent focus:border-primary/50 rounded-xl transition-all outline-none text-foreground text-sm"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Professional Role</label>
              <div className="relative">
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full px-4 py-3 bg-secondary/30 glass border border-transparent focus:border-primary/50 rounded-xl transition-all outline-none text-foreground text-sm"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Location</label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full px-4 py-3 bg-secondary/30 glass border border-transparent focus:border-primary/50 rounded-xl transition-all outline-none text-foreground text-sm"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Bio</label>
              <div className="relative">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell your story..."
                  className="w-full px-4 py-3 bg-secondary/30 glass border border-transparent focus:border-primary/50 rounded-xl transition-all outline-none text-foreground text-sm resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 group">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">College Name</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full px-4 py-3 bg-secondary/30 glass border border-transparent focus:border-primary/50 rounded-xl transition-all outline-none text-foreground text-sm"
                />
              </div>

              <div className="space-y-2 group">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Department</label>
                <input
                  type="text"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-3 bg-secondary/30 glass border border-transparent focus:border-primary/50 rounded-xl transition-all outline-none text-foreground text-sm"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Year of Study</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/30 glass border border-transparent focus:border-primary/50 rounded-xl transition-all outline-none text-foreground text-sm appearance-none"
              >
                <option value="" disabled className="bg-background">Select Year</option>
                <option value="1st Year" className="bg-background">1st Year</option>
                <option value="2nd Year" className="bg-background">2nd Year</option>
                <option value="3rd Year" className="bg-background">3rd Year</option>
                <option value="4th Year" className="bg-background">4th Year</option>
                <option value="Master's" className="bg-background">Master's</option>
                <option value="PhD" className="bg-background">PhD</option>
                <option value="Graduate" className="bg-background">Graduate</option>
              </select>
            </div>

            <div className="space-y-3 group">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Technical Skills</label>
              <div className="w-full min-h-[50px] p-2 bg-secondary/30 glass border border-transparent focus-within:border-primary/50 rounded-xl transition-all flex flex-wrap gap-2 items-center">
                {skills.map((skill) => (
                  <motion.span 
                    key={skill} 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 gradient-primary text-primary-foreground rounded-lg text-xs font-bold shadow-md shadow-primary/20"
                  >
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => removeSkill(skill)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
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
                  placeholder={skills.length === 0 ? "Type skill and press Enter..." : "Add more..."}
                  className="flex-1 min-w-[120px] bg-transparent outline-none text-foreground text-sm py-1 px-2 placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-[10px] text-muted-foreground ml-1">Tip: Press Enter or use commas to separate multiple skills.</p>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}
