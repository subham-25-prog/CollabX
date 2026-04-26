"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"

const allSkills = [
  "React", "TypeScript", "Node.js", "Python", "Go", "Swift",
  "Figma", "UI/UX", "TensorFlow", "AWS", "Firebase", "MongoDB",
  "PostgreSQL", "GraphQL", "Docker", "Kubernetes"
]

const availabilityOptions = ["Available", "Part-time", "Busy"]

interface TeamFiltersProps {
  selectedSkills: string[]
  onSkillsChange: (skills: string[]) => void
  selectedAvailability: string | null
  onAvailabilityChange: (availability: string | null) => void
}

export function TeamFilters({
  selectedSkills,
  onSkillsChange,
  selectedAvailability,
  onAvailabilityChange,
}: TeamFiltersProps) {
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onSkillsChange(selectedSkills.filter((s) => s !== skill))
    } else {
      onSkillsChange([...selectedSkills, skill])
    }
  }

  const clearAll = () => {
    onSkillsChange([])
    onAvailabilityChange(null)
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {(selectedSkills.length > 0 || selectedAvailability) && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Availability */}
      <div className="mb-6">
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          Availability
        </label>
        <div className="flex flex-wrap gap-2">
          {availabilityOptions.map((option) => (
            <motion.button
              key={option}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAvailabilityChange(selectedAvailability === option ? null : option)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedAvailability === option
                  ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
              }`}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          Skills
        </label>
        <div className="flex flex-wrap gap-2">
          {allSkills.map((skill) => (
            <motion.button
              key={skill}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedSkills.includes(skill)
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-secondary/50 text-secondary-foreground hover:bg-secondary border border-transparent"
              }`}
            >
              {skill}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
