"use client"

import { motion } from "framer-motion"
import { MapPin, Calendar, Link as LinkIcon, MessageCircle, UserPlus, Edit3 } from "lucide-react"

const skills = [
  "React", "TypeScript", "Node.js", "Python", "AWS", "Next.js", "GraphQL", "Docker"
]

export function ProfileHeader() {
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-48 sm:h-64 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop"
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="relative -mt-20 sm:-mt-24">
          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative inline-block"
          >
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
              alt="Tom Wilson"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-4 border-background shadow-xl"
            />
            <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-background" />
          </motion.div>

          <div className="mt-4 sm:flex sm:items-start sm:justify-between">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tom Wilson</h1>
                <p className="text-muted-foreground mt-1">@tomwilson</p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-3 text-foreground max-w-xl leading-relaxed"
              >
                Software Engineer passionate about building products that make a difference. Love hackathons, open source, and helping fellow students succeed in tech.
              </motion.p>

              {/* Meta info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  San Francisco, CA
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Joined March 2024
                </span>
                <a href="#" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <LinkIcon className="w-4 h-4" />
                  tomwilson.dev
                </a>
              </motion.div>

              {/* Skills */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="flex flex-wrap gap-2 mt-4"
              >
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="flex items-center gap-6 mt-6"
              >
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">1.2K</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">456</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">28</p>
                  <p className="text-sm text-muted-foreground">Projects</p>
                </div>
              </motion.div>
            </div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center gap-3 mt-6 sm:mt-0"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-medium shadow-lg shadow-primary/20"
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Follow
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
              >
                <Edit3 className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
