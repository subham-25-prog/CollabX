"use client"

import { motion } from "framer-motion"
import { MapPin, UserPlus, MessageCircle } from "lucide-react"
import Link from "next/link"

interface UserCardProps {
  user: {
    id: string
    name: string
    avatar: string
    role: string
    bio: string
    skills: string[]
    availability: string
    location: string
  }
}

const availabilityColors: Record<string, string> = {
  Available: "bg-green-500/20 text-green-400 border-green-500/30",
  "Part-time": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Busy: "bg-red-500/20 text-red-400 border-red-500/30",
}

export function UserCard({ user }: UserCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Header with avatar and info */}
      <div className="flex items-start gap-4 mb-4">
        <Link href="/profile">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-14 h-14 rounded-xl object-cover ring-2 ring-transparent hover:ring-primary/30 transition-all"
            />
          </motion.div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href="/profile">
            <h3 className="font-semibold text-foreground hover:text-primary transition-colors truncate">
              {user.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground truncate">{user.role}</p>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{user.location}</span>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
            availabilityColors[user.availability]
          }`}
        >
          {user.availability}
        </span>
      </div>

      {/* Bio */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
        {user.bio}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {user.skills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="px-2.5 py-1 rounded-lg bg-secondary/50 text-secondary-foreground text-xs font-medium"
          >
            {skill}
          </span>
        ))}
        {user.skills.length > 4 && (
          <span className="px-2.5 py-1 rounded-lg bg-secondary/50 text-muted-foreground text-xs font-medium">
            +{user.skills.length - 4}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20"
        >
          <UserPlus className="w-4 h-4" />
          Invite to Team
        </motion.button>
        <Link href="/chat">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  )
}
