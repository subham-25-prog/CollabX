import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, where, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth/auth-provider"

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  read: boolean
  timestamp: any
  senderId?: string
}

export function useNotifications() {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!profile?.uid) {
      setNotifications([])
      setUnreadCount(0)
      setIsLoading(false)
      return
    }

    const notificationsRef = collection(db, "users", profile.uid, "notifications")
    const q = query(notificationsRef, orderBy("timestamp", "desc"), limit(50))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = []
      let unread = 0

      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Notification, 'id'>
        notifs.push({ id: doc.id, ...data })
        if (!data.read) {
          unread++
        }
      })

      setNotifications(notifs)
      setUnreadCount(unread)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [profile?.uid])

  return { notifications, unreadCount, isLoading }
}
