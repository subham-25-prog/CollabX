"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { TeamFilters } from "@/components/teams/team-filters"
import { UserCard } from "@/components/teams/user-card"
import { Search, Filter, X } from "lucide-react"

const users = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    role: "Full Stack Developer",
    bio: "Building cool stuff with React and Node.js. Love hackathons and coffee.",
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    availability: "Available",
    location: "Boston, MA",
  },
  {
    id: "2",
    name: "Alex Rivera",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    role: "ML Engineer",
    bio: "Passionate about AI/ML and its applications in healthcare. Open to collaborations!",
    skills: ["Python", "TensorFlow", "PyTorch", "AWS"],
    availability: "Part-time",
    location: "San Jose, CA",
  },
  {
    id: "3",
    name: "Emily Park",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    role: "Product Designer",
    bio: "UX enthusiast with a love for creating beautiful and functional interfaces.",
    skills: ["Figma", "UI/UX", "Prototyping", "Research"],
    availability: "Available",
    location: "Seattle, WA",
  },
  {
    id: "4",
    name: "Marcus Johnson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    role: "Backend Developer",
    bio: "System design nerd. Currently exploring distributed systems and cloud architecture.",
    skills: ["Go", "Kubernetes", "PostgreSQL", "Redis"],
    availability: "Busy",
    location: "Austin, TX",
  },
  {
    id: "5",
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    role: "iOS Developer",
    bio: "Swift lover. Building delightful mobile experiences one app at a time.",
    skills: ["Swift", "SwiftUI", "Xcode", "Firebase"],
    availability: "Available",
    location: "New York, NY",
  },
  {
    id: "6",
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    role: "Data Scientist",
    bio: "Turning data into insights. Looking for teams working on impactful projects.",
    skills: ["Python", "R", "SQL", "Tableau"],
    availability: "Part-time",
    location: "Chicago, IL",
  },
]

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.some((skill) => user.skills.includes(skill))
    
    const matchesAvailability = !selectedAvailability || 
      user.availability === selectedAvailability

    return matchesSearch && matchesSkills && matchesAvailability
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16 pb-20 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Find Your <span className="gradient-text">Dream Team</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Connect with talented students who share your passion. Build something amazing together.
            </p>
          </motion.div>

          {/* Search and Filter bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, role, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl glass border border-transparent focus:border-primary/30 transition-all duration-200 outline-none placeholder:text-muted-foreground"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                showFilters 
                  ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "glass hover:border-primary/30"
              }`}
            >
              {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
              <span>Filters</span>
              {(selectedSkills.length > 0 || selectedAvailability) && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                  {selectedSkills.length + (selectedAvailability ? 1 : 0)}
                </span>
              )}
            </motion.button>
          </motion.div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mb-6"
              >
                <TeamFilters
                  selectedSkills={selectedSkills}
                  onSkillsChange={setSelectedSkills}
                  selectedAvailability={selectedAvailability}
                  onAvailabilityChange={setSelectedAvailability}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-sm text-muted-foreground mb-6"
          >
            Showing {filteredUsers.length} of {users.length} students
          </motion.p>

          {/* User cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <UserCard user={user} />
              </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {filteredUsers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center opacity-50">
                <Search className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No results found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </motion.div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
