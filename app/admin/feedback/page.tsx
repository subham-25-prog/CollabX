"use client"

import React, { useEffect, useState } from "react"
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MessageSquare, 
  Clock, 
  User, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Filter,
  Search,
  MessageCircle,
  Bug,
  Lightbulb,
  Heart
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"

interface Feedback {
  id: string
  userId: string
  userName: string
  type: string
  message: string
  status: string
  timestamp: any
}

const TYPE_ICONS: Record<string, any> = {
  suggestion: { icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  bug: { icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10' },
  praise: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  other: { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
}

export default function AdminFeedbackPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (profile && profile.role?.toLowerCase() !== 'admin') {
      router.push('/feed')
      return
    }

    const fetchFeedbacks = async () => {
      try {
        const q = query(collection(db, "feedback"), orderBy("timestamp", "desc"))
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Feedback[]
        setFeedbacks(data)
      } catch (error) {
        console.error("Error fetching feedback:", error)
        toast.error("Failed to load feedbacks")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedbacks()
  }, [profile, router])

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "feedback", id), { status: newStatus })
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f))
      toast.success(`Feedback marked as ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return

    try {
      await deleteDoc(doc(db, "feedback", id))
      setFeedbacks(prev => prev.filter(f => f.id !== id))
      toast.success("Feedback deleted")
    } catch (error) {
      toast.error("Failed to delete feedback")
    }
  }

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesFilter = filter === "all" || f.type === filter || f.status === filter
    const matchesSearch = f.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.message.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link 
              href="/feed" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Feed
            </Link>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              User <span className="gradient-text">Feedbacks</span>
              <span className="text-sm font-medium bg-secondary px-3 py-1 rounded-full text-muted-foreground">
                {feedbacks.length} Total
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search feedbacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl bg-secondary/50 border border-transparent focus:border-primary/30 outline-none w-full sm:w-64 transition-all"
              />
            </div>
            <div className="flex p-1 bg-secondary/50 rounded-xl border border-white/5">
              {['all', 'suggestion', 'bug'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    filter === t ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filteredFeedbacks.map((f) => {
              const TypeIcon = TYPE_ICONS[f.type]?.icon || MessageSquare
              const typeStyle = TYPE_ICONS[f.type] || TYPE_ICONS.other

              return (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-strong border border-white/10 rounded-2xl overflow-hidden group hover:border-primary/20 transition-all"
                >
                  <div className="p-6 flex flex-col sm:flex-row gap-6">
                    {/* Left side: User & Type */}
                    <div className="sm:w-48 space-y-4 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                          {f.userName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate text-foreground">{f.userName}</p>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {f.timestamp ? formatDistanceToNow(f.timestamp.toDate(), { addSuffix: true }) : "just now"}
                          </p>
                        </div>
                      </div>

                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${typeStyle.bg} ${typeStyle.color} text-xs font-bold`}>
                        <TypeIcon className="w-4 h-4" />
                        {f.type.charAt(0).toUpperCase() + f.type.slice(1)}
                      </div>
                    </div>

                    {/* Middle: Message */}
                    <div className="flex-1 space-y-4">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                        {f.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                          f.status === 'reviewed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {f.status === 'reviewed' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {f.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex sm:flex-col gap-2 justify-end sm:justify-start">
                      <button
                        onClick={() => handleStatusUpdate(f.id, f.status === 'reviewed' ? 'pending' : 'reviewed')}
                        className={`p-3 rounded-xl transition-all ${
                          f.status === 'reviewed' 
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                            : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                        }`}
                        title={f.status === 'reviewed' ? "Mark as Pending" : "Mark as Reviewed"}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                        title="Delete Feedback"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredFeedbacks.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <Filter className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No feedbacks found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
