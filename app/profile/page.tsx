"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { PostCard } from "@/components/feed/post-card"

const userPosts = [
  {
    id: "1",
    author: {
      name: "Tom Wilson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      role: "Software Engineer",
    },
    content: "Excited to share that I just completed my AWS Solutions Architect certification! It was a challenging journey but totally worth it. Happy to help anyone preparing for the exam.",
    likes: 189,
    comments: 34,
    shares: 12,
    timestamp: "1d ago",
    isLiked: false,
  },
  {
    id: "2",
    author: {
      name: "Tom Wilson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      role: "Software Engineer",
    },
    content: "Looking for a UI/UX designer to join our team for the upcoming TreeHacks hackathon at Stanford! We're building something exciting in the EdTech space. DM if interested!",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop",
    likes: 78,
    comments: 23,
    shares: 5,
    timestamp: "3d ago",
    isLiked: true,
  },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("posts")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16 pb-20 lg:pb-8">
        <ProfileHeader />
        
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          {/* Content based on active tab */}
          <div className="mt-6">
            {activeTab === "posts" && (
              <div className="space-y-6">
                {userPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </div>
            )}
            
            {activeTab === "achievements" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="glass rounded-2xl p-5 flex items-center gap-4"
                  >
                    <div className={`w-14 h-14 rounded-xl ${achievement.color} flex items-center justify-center text-2xl`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {activeTab === "projects" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="glass rounded-2xl overflow-hidden group"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{project.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}

const achievements = [
  {
    id: "1",
    icon: "🏆",
    title: "HackMIT Winner",
    description: "1st Place - AI Track",
    color: "bg-yellow-500/20",
  },
  {
    id: "2",
    icon: "⭐",
    title: "Top Contributor",
    description: "Open Source Champion",
    color: "bg-purple-500/20",
  },
  {
    id: "3",
    icon: "🎯",
    title: "AWS Certified",
    description: "Solutions Architect",
    color: "bg-orange-500/20",
  },
  {
    id: "4",
    icon: "🚀",
    title: "10 Projects",
    description: "Project Milestone",
    color: "bg-blue-500/20",
  },
]

const projects = [
  {
    id: "1",
    title: "AI Study Buddy",
    description: "An AI-powered study companion that helps students learn more effectively.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
    tags: ["React", "OpenAI", "TypeScript"],
  },
  {
    id: "2",
    title: "Campus Connect",
    description: "A platform for students to find study groups and events on campus.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop",
    tags: ["Next.js", "Supabase", "Tailwind"],
  },
  {
    id: "3",
    title: "EcoTrack",
    description: "Track your carbon footprint and get personalized sustainability tips.",
    image: "https://images.unsplash.com/photo-1518173946687-a4c036bc90f5?w=600&h=400&fit=crop",
    tags: ["React Native", "Node.js", "MongoDB"],
  },
]
