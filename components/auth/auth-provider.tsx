"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"

interface UserProfile {
  uid: string
  email: string
  name: string
  avatar: string
  role: string
  bio: string
  skills: string[]
  availability: string
  location: string
  achievements?: any[]
  projects?: any[]
  following?: string[]
  followers?: string[]
  onboardingCompleted?: boolean
}

interface AuthContextType {
  user: FirebaseUser | null
  profile: UserProfile | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true)
      setUser(firebaseUser)

      if (firebaseUser) {
        // Fetch or create user profile in Firestore
        const userRef = doc(db, "users", firebaseUser.uid)
        
        try {
          // Use getDoc first to ensure we fetch from the server. 
          // onSnapshot can sometimes fire with an empty cache if offline, 
          // causing the app to overwrite existing profiles.
          const docSnap = await getDoc(userRef)
          
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile)
          } else {
            // Create default profile for new user
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.email?.split('@')[0] || "New User",
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${firebaseUser.uid}`,
              role: "Student",
              bio: "Hey there! I am using CollabX.",
              skills: [],
              availability: "Available",
              location: "Earth",
              onboardingCompleted: false,
            }
            await setDoc(userRef, newProfile)
            setProfile(newProfile)
          }
        } catch (error) {
          console.error("Error creating or fetching user profile:", error)
        } finally {
          setIsLoading(false)
        }

        // Setup real-time listener for profile updates
        const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile)
          }
        })

        return () => unsubscribeProfile()
      } else {
        setProfile(null)
        setIsLoading(false)
        // Optionally redirect to auth page if not logged in
        // router.push("/auth") // Don't enforce globally here, handle per page to avoid infinite loops on /auth
      }
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (!user) return
    const updatePresence = async () => {
      try {
        const userRef = doc(db, "users", user.uid)
        await updateDoc(userRef, { lastActive: serverTimestamp() })
      } catch (error) {
        console.error("Failed to update presence:", error)
      }
    }
    updatePresence()
    const interval = setInterval(updatePresence, 1 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
