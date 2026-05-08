"use client"

import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { motion } from "framer-motion"

export default function TermsPage() {
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
            <h1 className="text-3xl font-bold mb-6 gradient-text">Terms and Conditions</h1>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
                <p>By accessing and using CollabX, you agree to be bound by these Terms and Conditions. If you do not agree, please refrain from using the platform.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-2">2. User Accounts</h2>
                <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You must provide accurate information during onboarding.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-2">3. Content Guidelines</h2>
                <p>Users are expected to maintain professional and respectful behavior. Any content that is deemed inappropriate, offensive, or infringing on intellectual property will be removed by administrators.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-2">4. Privacy</h2>
                <p>Your use of CollabX is also governed by our Privacy Policy. We collect and use your data to improve the collaboration experience between students.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-2">5. Limitations</h2>
                <p>CollabX is provided "as is" without any warranties. We are not liable for any disputes that arise between collaborators met through the platform.</p>
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
