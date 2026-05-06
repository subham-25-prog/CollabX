"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { UserCircle, Briefcase, MapPin, AlignLeft, Sparkles, Loader2, Check, ArrowRight, Phone } from "lucide-react"

export default function OnboardingPage() {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    gender: "",
    location: "",
    bio: "",
    skills: "",
    mobile: "",
  })

  // Pre-fill name if available
  useEffect(() => {
    if (profile && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: profile.name !== "New User" ? profile.name : ""
      }))
    }
  }, [profile])

  // Redirect if already onboarded or not logged in
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/")
      } else if (profile?.onboardingCompleted) {
        router.replace("/feed")
      }
    }
  }, [user, profile, isLoading, router])

  if (isLoading || !user || profile?.onboardingCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert skills string to array
    const skillsArray = formData.skills
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0)

    setIsSubmitting(true)

    try {
      const userRef = doc(db, "users", user.uid)
      
      // Security: Sanitize role to prevent unauthorized admin access
      let sanitizedRole = formData.role || "Student"
      if (sanitizedRole.toLowerCase().includes('admin')) {
        sanitizedRole = "Student"
      }

      await updateDoc(userRef, {
        name: formData.name || "Student",
        role: sanitizedRole,
        gender: formData.gender || "Not specified",
        location: formData.location || "Earth",
        bio: formData.bio || "I'm ready to collaborate!",
        skills: skillsArray,
        mobile: formData.mobile || "",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.name || "Student")}`,
        onboardingCompleted: true
      })
      
      // Force reload or push to feed (context will update automatically but might take a tick)
      router.push("/feed")
    } catch (error) {
      console.error("Error updating profile during onboarding", error)
      setIsSubmitting(false)
    }
  }

  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl glass rounded-3xl p-8 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to CollabX</h1>
          <p className="text-muted-foreground">Let's set up your profile to help you find the best teammates.</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary/50 h-2 rounded-full mb-8 overflow-hidden">
          <motion.div 
            className="h-full gradient-primary rounded-full"
            initial={{ width: "33%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); setStep(s => s + 1) }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    Your Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="e.g. Frontend Developer, UI Designer"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="+1 234 567 8900"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    Gender
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground appearance-none"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Location (or College Name)
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. MIT, Boston"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-muted-foreground" />
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    required
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us a bit about yourself and what you're looking for..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground resize-none"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    required
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="React, Node.js, Python, Figma"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 transition-colors outline-none text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    These help others find you when building teams.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
              >
                Back
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {step < 3 ? (
                <>
                  Continue <ArrowRight className="w-4 h-4" />
                </>
              ) : isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Complete Setup <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
