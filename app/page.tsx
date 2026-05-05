"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowRight, Search, Trophy, Users, MessageSquare, 
  Heart, MessageCircle, Share2, Plus, Code,
  Sparkles, Globe, Shield, Terminal, Rocket, ChevronRight,
  UserPlus
} from "lucide-react"
import { LogoIcon } from "@/components/ui/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth/auth-provider"

export default function LandingPage() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-indigo-500/30 text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <LogoIcon className="group-hover:scale-110 transition-transform duration-500 ease-out text-indigo-400" />
              <span className="text-2xl font-black tracking-tight text-foreground">
                Collab<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">X</span>
              </span>
            </Link>
            
            {profile && (
              <div className="hidden md:flex items-center gap-8 bg-white/5 px-6 py-2 rounded-full border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
                <Link href="/" className="text-sm font-semibold text-white transition-colors">Home</Link>
                <Link href="/teams" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Find Team</Link>
                <Link href="/feed" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Post</Link>
                <Link href="/chat" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Chat</Link>
                <Link href="/profile" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Profile</Link>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <Link 
                href="/auth"
                className="hidden sm:inline-block px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link 
                href="/auth"
                className="relative group inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-bold text-white transition-all duration-300"
              >
                <span className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 background-animate opacity-80 group-hover:opacity-100 shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300" />
                <span className="absolute inset-[1px] rounded-[11px] bg-background/40 backdrop-blur-sm" />
                <span className="relative flex items-center gap-2">
                  Sign Up <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-4 sm:px-6 flex items-center min-h-screen">
        {/* Deep Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(99,102,241,0.15),transparent_60%)]" />
          
          <motion.div
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-indigo-600/20 blur-[150px] mix-blend-screen opacity-50"
          />
          <motion.div
            animate={{ rotate: [360, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 -right-1/4 w-[700px] h-[700px] rounded-full bg-purple-600/20 blur-[150px] mix-blend-screen opacity-40"
          />
          
          {/* Subtle Mesh Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_20%,#000_100%,transparent_100%)]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center z-10 w-full mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 backdrop-blur-md mb-10 shadow-[0_0_30px_rgba(99,102,241,0.15)]"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold tracking-wide text-indigo-200 uppercase letter-spacing-1">
              The Next-Gen Collaboration Hub
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-6xl sm:text-7xl md:text-8xl font-black text-foreground mb-8 leading-[1.1] tracking-tight"
          >
            Build Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 background-animate">
              Dream Team.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-medium leading-relaxed"
          >
            Find like-minded people, collaborate on groundbreaking projects, and achieve more together. The ultimate network for innovators.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link 
              href="/teams"
              className="relative group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300"
            >
              <span className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-90 group-hover:opacity-100 shadow-[0_0_40px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] transition-all duration-500" />
              <span className="relative flex items-center gap-2">
                Find Teammates <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </span>
            </Link>
            <Link 
              href="/feed"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-lg backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            >
              Post Requirement <Plus className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-6 tracking-tight">
              Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Scale.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Find Teammates",
                description: "Filter by skills, roles, and experience to find the perfect match for your next hackathon or startup.",
                color: "from-blue-500 to-cyan-500",
                shadow: "shadow-blue-500/20"
              },
              {
                icon: Trophy,
                title: "Post Achievements",
                description: "Share your wins, projects, and milestones with a network of driven individuals.",
                color: "from-purple-500 to-pink-500",
                shadow: "shadow-purple-500/20"
              },
              {
                icon: Users,
                title: "Recruit Members",
                description: "Create team requirement posts to quickly onboard talented developers and designers.",
                color: "from-indigo-500 to-blue-500",
                shadow: "shadow-indigo-500/20"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`group relative rounded-3xl p-8 bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:shadow-2xl ${feature.shadow}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interface Preview Section (Feed, Teams, Chat) */}
      <section className="py-32 px-4 sm:px-6 relative z-10 overflow-hidden bg-white/[0.02] border-y border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.1),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left side: UI Mockups */}
            <div className="relative h-[600px] w-full perspective-1000">
              
              {/* Feed Card */}
              <motion.div 
                initial={{ opacity: 0, x: -50, rotateY: 15 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 15 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="absolute top-0 left-0 w-[400px] rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-6 z-20"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12 border-2 border-indigo-500/30">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-foreground font-bold text-lg">Alex Developer</h4>
                    <p className="text-xs text-muted-foreground">Full Stack Engineer • 2h ago</p>
                  </div>
                </div>
                <p className="text-foreground mb-4 text-sm leading-relaxed">
                  Just launched our new AI tool at the global hackathon and won 1st place! 🏆 Huge thanks to my amazing teammates on CollabX who made this possible.
                </p>
                <div className="rounded-xl overflow-hidden mb-4 border border-border">
                  <div className="h-32 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <Rocket className="w-12 h-12 text-indigo-400/50" />
                  </div>
                </div>
                <div className="flex items-center gap-6 text-slate-400">
                  <button className="flex items-center gap-2 hover:text-pink-500 transition-colors">
                    <Heart className="w-5 h-5" /> <span className="text-sm">248</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-5 h-5" /> <span className="text-sm">42</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-500 transition-colors ml-auto">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>

              {/* Team Match Card */}
              <motion.div 
                initial={{ opacity: 0, y: 50, rotateY: 15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 15 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute bottom-10 right-0 w-[360px] rounded-2xl border border-border bg-card/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(99,102,241,0.1)] p-6 z-30"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                    Hiring
                  </span>
                </div>
                <h4 className="text-foreground font-bold text-xl mb-2">Frontend Wizard Needed</h4>
                <p className="text-muted-foreground text-sm mb-4">Looking for a React expert to help build a Web3 dashboard for an upcoming hackathon.</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['React', 'Tailwind', 'Web3'].map(skill => (
                    <span key={skill} className="px-2 py-1 rounded-md bg-secondary text-foreground text-xs border border-border">
                      {skill}
                    </span>
                  ))}
                </div>
                <button className="w-full py-3 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                  <UserPlus className="w-4 h-4" /> Apply to Join
                </button>
              </motion.div>

              {/* Chat Preview (Background) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute top-20 right-10 w-[280px] rounded-2xl border border-border bg-card/80 backdrop-blur-md shadow-xl p-4 z-10"
              >
                <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center relative">
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border border-[#0A0A0F]"></span>
                  </div>
                  <span className="text-white text-sm font-semibold">Project Chat</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 text-xs text-slate-300 w-4/5">
                    Hey! Are we still on for the meeting?
                  </div>
                  <div className="bg-indigo-500 rounded-2xl rounded-tr-none p-3 text-xs text-white w-4/5 ml-auto">
                    Yes, hopping on in 5 mins! 🚀
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right side: Text content */}
            <div className="space-y-8">
              <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
                Designed for <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Seamless Interaction.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Experience a platform that feels like a blend of your favorite social and productivity tools. Clean aesthetics, glassmorphic elements, and instant updates keep you in the flow.
              </p>
              
              <ul className="space-y-6 mt-8">
                {[
                  { title: "LinkedIn-style Feed", desc: "Share updates, polls, and rich media." },
                  { title: "Smart Matching", desc: "Algorithm finds the exact skills your team lacks." },
                  { title: "Real-time Chat", desc: "Instant messaging with your new teammates." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{item.title}</h4>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_center,rgba(99,102,241,0.2),transparent_70%)] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center relative z-10 border border-indigo-500/20 bg-background/60 backdrop-blur-2xl rounded-[3rem] p-12 sm:p-24 shadow-[0_0_100px_rgba(99,102,241,0.1)] overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <h2 className="text-5xl sm:text-6xl font-black text-foreground mb-6 tracking-tight relative z-10">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Launch?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium relative z-10">
            Join the fastest-growing network of builders, designers, and innovators. Your next big opportunity is one connection away.
          </p>
          
          <Link 
            href="/auth"
            className="relative group inline-flex items-center justify-center px-12 py-6 rounded-2xl font-black text-white text-xl transition-all duration-300 hover:scale-105 z-10"
          >
            <span className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-100 shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-all duration-300" />
            <span className="absolute inset-[2px] rounded-[14px] bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay" />
            <span className="relative flex items-center gap-3">
              Get Started for Free <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 border-t border-border bg-background/90 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <LogoIcon className="w-8 h-8 text-indigo-400" />
                <span className="text-2xl font-black tracking-tight text-foreground">
                  Collab<span className="text-indigo-400">X</span>
                </span>
              </div>
              <p className="text-muted-foreground max-w-sm mb-6">
                The premier platform for finding teammates, showcasing projects, and collaborating with top talent.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li><Link href="/feed" className="hover:text-indigo-400 transition-colors">Feed</Link></li>
                <li><Link href="/teams" className="hover:text-indigo-400 transition-colors">Find Teams</Link></li>
                <li><Link href="/chat" className="hover:text-indigo-400 transition-colors">Chat</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li><Link href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-indigo-400 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} CollabX. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-slate-500">
              {/* Social icons placeholders */}
              <a href="#" className="hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><MessageCircle className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
