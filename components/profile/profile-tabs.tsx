"use client"

import { motion } from "framer-motion"
import { FileText, Award, FolderKanban, Users } from "lucide-react"

const tabs = [
  { id: "posts", label: "Posts", icon: FileText, count: 24 },
  { id: "achievements", label: "Achievements", icon: Award, count: 8 },
  { id: "projects", label: "Projects", icon: FolderKanban, count: 12 },
  { id: "teams", label: "Teams", icon: Users, count: 3 },
]

interface ProfileTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 glass rounded-xl overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              isActive 
                ? "bg-primary/10 text-primary" 
                : "bg-secondary text-secondary-foreground"
            }`}>
              {tab.count}
            </span>
            {isActive && (
              <motion.div
                layoutId="activeProfileTab"
                className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
