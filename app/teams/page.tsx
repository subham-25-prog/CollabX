"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Sidebar } from "@/components/layout/sidebar"
import { TeamFilters } from "@/components/teams/team-filters"
import { UserCard } from "@/components/teams/user-card"
import { Search, Filter, X, Loader2, Plus, Users as UsersIcon, FolderKanban, Lightbulb, Sparkles } from "lucide-react"
import { getAllUsers } from "@/lib/db"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { ProjectCard } from "@/components/teams/project-card"
import dynamic from "next/dynamic"

const CreateProjectModal = dynamic(() => import("@/components/teams/create-project-modal").then(mod => mod.CreateProjectModal), { ssr: false })

export default function TeamsPage() {
  const { profile, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"students" | "projects" | "my_projects" | "startups">("projects")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null)
  const [displayLimit, setDisplayLimit] = useState(20)

  // Reset display limit when tab changes
  useEffect(() => {
    setDisplayLimit(20)
  }, [activeTab])

  useEffect(() => {
    if (!isAuthLoading && profile && profile.onboardingCompleted === false) {
      router.replace("/onboarding")
    }
  }, [profile, isAuthLoading, router])

  useEffect(() => {
    async function fetchData() {
      try {
        const usersData = await getAllUsers()
        setUsers(usersData)
      } catch (error) {
        console.error("Failed to fetch users", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()

    // Listen to projects
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setProjects(projectsData)
    })

    return () => unsubscribe()
  }, [])

  const filteredUsers = users.filter((user) => {
    const userSkills = user.skills || []
    
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userSkills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.some((skill) => userSkills.includes(skill))
    
    const matchesAvailability = !selectedAvailability || 
      user.availability === selectedAvailability

    return matchesSearch && matchesSkills && matchesAvailability
  })

  const filteredProjects = projects.filter((project) => {
    // Determine if it's "My Project" (owner or member)
    const isMyProject = profile?.uid === project.owner.id || (project.members && project.members.includes(profile?.uid))
    if (activeTab === "projects" && (isMyProject || project.type === 'startup')) return false
    if (activeTab === "my_projects" && !isMyProject) return false
    if (activeTab === "startups" && project.type !== 'startup') return false

    const projectSkills = project.skills || []
    
    const matchesSearch =
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      projectSkills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.some((skill) => projectSkills.includes(skill))
    
    return matchesSearch && matchesSkills
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pt-16 pb-20 lg:pb-8 w-full min-w-0">
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

          {/* Tabs and Create Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8"
          >
            <div className="flex p-1 rounded-xl bg-secondary/50 backdrop-blur-md overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveTab("projects")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "projects" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FolderKanban className="w-4 h-4" /> Projects
              </button>
              <button
                onClick={() => setActiveTab("my_projects")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "my_projects" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FolderKanban className="w-4 h-4" /> My Projects
              </button>
              <button
                onClick={() => setActiveTab("startups")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "startups" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Lightbulb className="w-4 h-4" /> Startup Ideas
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "students" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UsersIcon className="w-4 h-4" /> Students
              </button>
            </div>

            {(activeTab === "projects" || activeTab === "my_projects" || activeTab === "startups") && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-medium shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" /> {activeTab === "startups" ? "Post Idea" : "Post Requirement"}
              </motion.button>
            )}
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
          {!isLoading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-sm text-muted-foreground mb-6"
            >
              {activeTab === "students" ? (
                <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-primary" /> <strong className="text-foreground">{filteredUsers.length}</strong> Happy Students found</span>
              ) : (
                <span>Showing {filteredProjects.length} results</span>
              )}
            </motion.p>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {activeTab === "students" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredUsers.slice(0, displayLimit).map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: (index % 20) * 0.05 }}
                    >
                      <UserCard user={{...user, uid: user.id} as any} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProjects.slice(0, displayLimit).map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: (index % 20) * 0.05 }}
                    >
                      <ProjectCard project={project} allUsers={users} />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {((activeTab === "students" && filteredUsers.length > displayLimit) || 
                (activeTab !== "students" && filteredProjects.length > displayLimit)) && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setDisplayLimit(prev => prev + 20)}
                    className="px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}

              {/* Empty state */}
              {((activeTab === "students" && filteredUsers.length === 0) || 
                ((activeTab === "projects" || activeTab === "my_projects" || activeTab === "startups") && filteredProjects.length === 0)) && (
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
            </>
          )}
        </div>
        </main>
      </div>

      <MobileNav />

      <AnimatePresence>
        {showCreateModal && (
          <CreateProjectModal 
            onClose={() => setShowCreateModal(false)} 
            projectType={activeTab === "startups" ? "startup" : "project"}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
