"use client"

import { useState } from "react"
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "framer-motion"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthAnimation } from "@/components/auth/auth-animation"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  // Spotlight Effect State
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Animation */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary">
        <AuthAnimation />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center px-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-bold text-primary-foreground mb-4"
            >
              CollabX
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-primary-foreground/80 max-w-md"
            >
              Find your perfect team. Build amazing projects together.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text">CollabX</h1>
            <p className="text-muted-foreground mt-2">Find your perfect team</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            onMouseMove={handleMouseMove}
            className="group glass rounded-2xl p-8 relative overflow-hidden"
          >
            {/* Spotlight background */}
            <motion.div
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
              style={{
                background: useMotionTemplate`
                  radial-gradient(
                    650px circle at ${mouseX}px ${mouseY}px,
                    rgba(var(--primary), 0.1),
                    transparent 80%
                  )
                `,
              }}
            />
            
            <div className="relative z-10">
              {/* Tab switcher */}
              <div className="flex gap-2 mb-8 p-1 bg-secondary/50 rounded-xl">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isLogin 
                      ? "bg-primary text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                    !isLogin 
                      ? "bg-primary text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <AnimatePresence mode="wait">
                <AuthForm key={isLogin ? "login" : "signup"} isLogin={isLogin} />
              </AnimatePresence>
            </div>
          </motion.div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
