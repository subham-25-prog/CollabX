"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Image, Smile, MapPin, Users, Loader2, Sparkles, BarChart2, Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { createPost } from "@/lib/db"
import { toast } from "sonner"
import imageCompression from "browser-image-compression"

interface CreatePostModalProps {
  onClose: () => void
}

const EMOJIS = ['😀','😂','🔥','🚀','✨','🎉','❤️','👍','🙌','👀','💡','💻','🎓','🛠️','🎨','🧠','☕','🍕','⚽','🎸']
const FUNNY_SNIPPETS = [
  '(╯°□°)╯︵ ┻━┻', 
  'ʕ•ᴥ•ʔ', 
  '¯\\_(ツ)_/¯', 
  '✨ Coding in progress ✨', 
  '🚀 Ready for liftoff!', 
  'Debugging... 🐛🔫',
  'It works on my machine 🤷‍♂️',
  'git push --force 💥'
]

export function CreatePostModal({ onClose }: CreatePostModalProps) {
  const { profile } = useAuth()
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video' | null>(null)
  
  const [activePopover, setActivePopover] = useState<'emoji' | null>(null)
  
  // Poll State
  const [showPoll, setShowPoll] = useState(false)
  const [pollOptions, setPollOptions] = useState<string[]>(['', ''])

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    const validPollOptions = pollOptions.map(opt => opt.trim()).filter(opt => opt.length > 0)
    
    if (!content.trim() && !selectedImage && validPollOptions.length === 0) return
    if (!profile) return

    if (showPoll && validPollOptions.length < 2) {
      toast.error("A poll must have at least 2 options")
      return
    }
    
    setIsLoading(true)
    try {
      let finalImageUrl = undefined
      if (selectedFile) {
        let fileToUpload = selectedFile
        if (selectedMediaType === 'image') {
          try {
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: false
            }
            fileToUpload = await imageCompression(selectedFile, options)
          } catch (compressionError) {
            console.error("Compression failed, using original file", compressionError)
            fileToUpload = selectedFile
          }
        }
        const formData = new FormData()
        formData.append("image", fileToUpload)
        
        const response = await fetch("https://api.imgbb.com/1/upload?key=6e38ec9c63ca880872d00fe6e4be0417", {
          method: "POST",
          body: formData
        })
        
        const data = await response.json()
        if (data.success) {
          finalImageUrl = data.data.url
        } else {
          throw new Error("Failed to upload image")
        }
      } else if (selectedImage) {
        finalImageUrl = selectedImage
      }

      await createPost(
        {
          id: profile.uid,
          name: profile.name,
          avatar: profile.avatar,
          role: profile.role
        }, 
        content, 
        finalImageUrl,
        showPoll ? validPollOptions : undefined
      )
      toast.success("Post created successfully!")
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to create post")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const isVideo = file.type.startsWith('video/')
      if (isVideo) {
        toast.error("Video uploads are not supported on the free plan.")
        return
      }
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error(`Image size must be less than 5MB`)
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setSelectedMediaType(isVideo ? 'video' : 'image')
      }
      reader.readAsDataURL(file)
    }
  }

  const appendToContent = (text: string) => {
    setContent(prev => prev + text)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleMemeClick = () => {
    const randomSnippet = FUNNY_SNIPPETS[Math.floor(Math.random() * FUNNY_SNIPPETS.length)]
    appendToContent(`\n${randomSnippet}\n`)
    setActivePopover(null)
  }

  const handlePollClick = () => {
    setShowPoll(prev => !prev)
    setActivePopover(null)
  }

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
  }

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ''])
    }
  }

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions]
      newOptions.splice(index, 1)
      setPollOptions(newOptions)
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
        onClick={(e) => {
          e.stopPropagation()
          setActivePopover(null)
        }}
        className="w-full max-w-lg glass rounded-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold text-foreground">Create Post</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar relative">
          {/* Author info */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={profile?.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=fallback"}
              alt="Your profile"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20 bg-secondary"
            />
            <div>
              <p className="font-medium text-foreground">{profile?.name || "Loading..."}</p>
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium bg-secondary/50 px-2 py-0.5 rounded-full mt-0.5">
                <Users className="w-3.5 h-3.5" />
                Everyone
              </button>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={showPoll ? "Ask a question..." : "What's happening? Share a project, thought, or look for teammates..."}
            className="w-full min-h-[100px] bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-lg leading-relaxed"
            autoFocus
          />

          {/* Poll UI */}
          {showPoll && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 border border-border rounded-2xl p-4 space-y-3"
            >
              {pollOptions.map((opt, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handlePollOptionChange(index, e.target.value)}
                    placeholder={`Choice ${index + 1}`}
                    maxLength={25}
                    className="flex-1 bg-transparent border border-border focus:border-primary px-4 py-2.5 rounded-xl outline-none text-foreground text-sm transition-colors"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      onClick={() => removePollOption(index)}
                      className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 4 && (
                <button
                  onClick={addPollOption}
                  className="flex items-center gap-2 text-primary font-medium text-sm hover:underline py-1"
                >
                  <Plus className="w-4 h-4" />
                  Add option
                </button>
              )}
            </motion.div>
          )}

          {/* Selected image preview */}
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="relative mt-4 rounded-xl overflow-hidden border border-border"
            >
              {selectedMediaType === 'video' ? (
                <video
                  src={selectedImage}
                  controls
                  className="w-full h-auto max-h-[300px] object-contain bg-black/5"
                />
              ) : (
                <img
                  src={selectedImage}
                  alt="Selected"
                  unoptimized
                  className="w-full h-auto object-cover max-h-[300px] object-contain bg-black/5"
                />
              )}
              <button
                onClick={() => {
                  setSelectedImage(null)
                  setSelectedFile(null)
                  setSelectedMediaType(null)
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors shadow-sm"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </motion.div>
          )}

          {/* Popovers */}
          <AnimatePresence>
            {activePopover === 'emoji' && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-4 left-4 z-10 glass border border-border rounded-xl p-3 shadow-xl w-64"
              >
                <div className="grid grid-cols-5 gap-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        appendToContent(emoji)
                        setActivePopover(null)
                      }}
                      className="text-2xl hover:bg-secondary/80 p-1.5 rounded-lg transition-colors flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={(e) => { e.stopPropagation(); handleImageSelect(); }}
                className="p-2.5 rounded-full hover:bg-primary/10 transition-colors text-primary relative group"
                title="Media"
              >
                <Image className="w-5 h-5" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Media</span>
              </button>
              
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setActivePopover(activePopover === 'emoji' ? null : 'emoji'); 
                }}
                className={`p-2.5 rounded-full transition-colors relative group ${activePopover === 'emoji' ? 'bg-primary/20 text-primary' : 'hover:bg-primary/10 text-primary'}`}
                title="Emoji"
              >
                <Smile className="w-5 h-5" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Emoji</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleMemeClick(); }}
                className="p-2.5 rounded-full hover:bg-primary/10 transition-colors text-primary relative group"
                title="Fun Snippet"
              >
                <Sparkles className="w-5 h-5" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Magic Phrase</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handlePollClick(); }}
                className={`p-2.5 rounded-full transition-colors relative group ${showPoll ? 'bg-primary/20 text-primary' : 'hover:bg-primary/10 text-primary'}`}
                title="Poll"
              >
                <BarChart2 className="w-5 h-5" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Poll</span>
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={(!content.trim() && !selectedImage && !pollOptions.some(o => o.trim())) || isLoading || !profile}
              className="px-6 py-2 rounded-full gradient-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
