"use client"

import { createContext, useContext, useEffect, useState, useMemo, useRef } from "react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, arrayUnion } from "firebase/firestore"
import { messaging } from "@/lib/firebase"
import { getToken } from "firebase/messaging"
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
  college?: string
  year?: string
  dept?: string
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
  const userRef = useRef<string | null>(null)

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Only reset everything if the user actually changed
      if (firebaseUser?.uid === userRef.current && profile) {
        setIsLoading(false)
        return
      }
      
      userRef.current = firebaseUser?.uid || null
      setIsLoading(true)
      
      // Clear current profile only on user change to prevent session bleeding
      setProfile(null)
      setUser(firebaseUser)

      // Clean up previous profile listener if it exists
      if (unsubscribeProfile) {
        unsubscribeProfile()
        unsubscribeProfile = null
      }

      if (firebaseUser) {
        const uRef = doc(db, "users", firebaseUser.uid)
        
        try {
          const docSnap = await getDoc(uRef)
          
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile
            if (!data.email && firebaseUser.email) {
              data.email = firebaseUser.email
            }
            setProfile(data)
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "New User",
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "New User")}`,
              role: "Student",
              bio: "Hey there! I am using CollabX.",
              skills: [],
              availability: "Available",
              location: "Earth",
              onboardingCompleted: false,
            }
            await setDoc(uRef, newProfile)
            setProfile(newProfile)
          }
        } catch (error) {
          console.error("CRITICAL: Error fetching/creating user profile in Firestore:", error)
          // Ensure we don't hang in a loading state if Firestore fails
          setProfile(null)
        } finally {
          setIsLoading(false)
        }

        // Setup real-time listener for profile updates
        unsubscribeProfile = onSnapshot(uRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile
            // Ensure email is present from firebaseUser if missing in Firestore
            if (!data.email && firebaseUser.email) {
              data.email = firebaseUser.email
            }
            setProfile(data)
          }
        })

        // Request FCM Push Notification Permissions
        if (typeof window !== "undefined" && "Notification" in window) {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted" && messaging) {
              const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
              if (!vapidKey) return;
              
              getToken(messaging, { vapidKey }).then(async (currentToken) => {
                if (currentToken) {
                  await updateDoc(uRef, {
                    fcmTokens: arrayUnion(currentToken)
                  }).catch(e => console.error("Failed to save FCM token:", e));
                }
              }).catch((err) => {
                console.error("FCM Token retrieval error:", err);
              });
            }
          });
        }
      } else {
        setProfile(null)
        setIsLoading(false)
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeProfile) unsubscribeProfile()
    }
  }, [router, messaging])

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
    const interval = setInterval(updatePresence, 30 * 1000)
    return () => clearInterval(interval)
  }, [user])

  const authValue = useMemo(() => ({
    user,
    profile,
    isLoading
  }), [user, profile, isLoading])

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}
