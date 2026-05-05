"use client"

import { motion } from "framer-motion"
import { FileText, Award, FolderKanban, Users } from "lucide-react"

const tabs: { id: string; label: string; icon: any; count?: number }[] = [
  { id: "posts", label: "Posts", icon: FileText },
  { id: "achievements", label: "Achievements", icon: Award },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "teams", label: "Teams", icon: Users },
]

interface ProfileTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="flex items-center justify-between sm:justify-start gap-1 p-1.5 glass rounded-2xl overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 flex-1 sm:flex-none py-3 sm:px-5 sm:py-3 rounded-xl font-medium text-[10px] sm:text-sm whitespace-nowrap transition-all duration-300 ${
              isActive 
                ? "text-primary scale-105 sm:scale-100" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-6 h-6 sm:w-4 sm:h-4 transition-transform duration-300" />
            <span className="sm:inline">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-xs ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "bg-secondary text-secondary-foreground"
              }`}>
                {tab.count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="activeProfileTab"
                className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
