"use client"

import { createContext, useContext, useEffect, useState } from "react"
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
    let unsubscribeProfile: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true)
      setUser(firebaseUser)

      // Clean up previous profile listener if it exists
      if (unsubscribeProfile) {
        unsubscribeProfile()
        unsubscribeProfile = null
      }

      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid)
        
        try {
          const docSnap = await getDoc(userRef)
          
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile)
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
            await setDoc(userRef, newProfile)
            setProfile(newProfile)
          }
        } catch (error) {
          console.error("Error creating or fetching user profile:", error)
        } finally {
          setIsLoading(false)
        }

        // Setup real-time listener for profile updates
        unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile)
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
                  await updateDoc(userRef, {
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

  return (
    <AuthContext.Provider value={{ user, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
