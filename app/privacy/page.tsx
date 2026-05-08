"use client"

import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { motion } from "framer-motion"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pt-20 pb-24 px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto glass p-8 rounded-3xl"
          >
            <h1 className="text-3xl font-bold mb-6 gradient-text">Privacy Policy</h1>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-2">1. Data Collection</h2>
                <p>We collect information you provide directly to us, such as your name, email address, profile picture, and academic details when you create an account.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-2">2. How We Use Data</h2>
                <p>Your data is used to facilitate team matching, display your achievements to other students, and send notifications about project updates or messages.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-2">3. Data Sharing</h2>
                <p>We do not sell your personal data. Your profile information is visible to other authenticated users on the platform to enable collaboration.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-2">4. Security</h2>
                <p>We use Firebase's secure infrastructure to protect your data. However, no method of transmission over the internet is 100% secure.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-2">5. Your Rights</h2>
                <p>You can update or delete your profile information at any time through the profile settings page.</p>
              </section>
              <p className="pt-4 border-t border-border text-xs">Last updated: May 2026</p>
            </div>
          </motion.div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
