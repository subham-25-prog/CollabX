"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowRight, Search, Trophy, Users, MessageSquare, 
  Heart, MessageCircle, Share2, Plus, Code,
  Sparkles, Globe, Shield, Terminal, Rocket, ChevronRight,
  UserPlus, Mail, Phone
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
            
            {/* Internal navigation links removed from landing page per user request */}
            
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
      <section className="relative pt-24 pb-16 px-4 sm:px-6 flex items-center">
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
            className="text-5xl sm:text-7xl md:text-8xl font-black text-foreground mb-6 sm:mb-8 leading-[1.1] tracking-tight"
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
            className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 sm:mb-12 font-medium leading-relaxed"
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
      <section className="py-16 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4 tracking-tight">
              Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Succeed.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: "Find Teammates",
                description: "Filter by skills and roles to find the perfect match for your next project.",
                color: "from-blue-500 to-cyan-500",
                shadow: "shadow-blue-500/10"
              },
              {
                icon: Trophy,
                title: "Post Achievements",
                description: "Share your wins and milestones with a network of driven individuals.",
                color: "from-purple-500 to-pink-500",
                shadow: "shadow-purple-500/10"
              },
              {
                icon: Users,
                title: "Recruit Members",
                description: "Create team requirements to quickly onboard talented builders.",
                color: "from-indigo-500 to-blue-500",
                shadow: "shadow-indigo-500/10"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className={`group relative rounded-2xl p-6 bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-xl ${feature.shadow}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interface Preview Section (Feed, Teams, Chat) */}
      <section className="py-20 px-4 sm:px-6 relative z-10 overflow-hidden bg-white/[0.02] border-y border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.1),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left side: UI Mockups */}
            <div className="relative h-[400px] sm:h-[500px] w-full perspective-1000 scale-75 origin-top sm:scale-90 sm:origin-center">
              
              {/* Feed Card */}
              <motion.div 
                initial={{ opacity: 0, x: -50, rotateY: 15 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 15 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="absolute top-0 left-0 w-[350px] rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-xl p-5 z-20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10 border-2 border-indigo-500/30">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-foreground font-bold text-base">Alex Developer</h4>
                    <p className="text-[10px] text-muted-foreground">Engineer • 2h ago</p>
                  </div>
                </div>
                <p className="text-foreground mb-3 text-xs leading-relaxed">
                  Just launched our new AI tool! 🏆 Huge thanks to my teammates on CollabX.
                </p>
                <div className="rounded-xl overflow-hidden mb-3 border border-border">
                  <div className="h-24 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <Rocket className="w-8 h-8 text-indigo-400/50" />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <button className="flex items-center gap-1.5 hover:text-pink-500">
                    <Heart className="w-4 h-4" /> <span className="text-xs">248</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-blue-500">
                    <MessageCircle className="w-4 h-4" /> <span className="text-xs">42</span>
                  </button>
                </div>
              </motion.div>

              {/* Team Match Card */}
              <motion.div 
                initial={{ opacity: 0, y: 50, rotateY: 15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 15 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute bottom-5 right-0 w-[320px] rounded-2xl border border-border bg-card/90 backdrop-blur-2xl shadow-2xl p-5 z-30"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h4 className="text-foreground font-bold text-lg mb-1.5">Frontend Dev Wanted</h4>
                <p className="text-muted-foreground text-xs mb-3">Looking for a React expert to help build a Web3 dashboard.</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['React', 'Tailwind'].map(skill => (
                    <span key={skill} className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-[10px] border border-border">
                      {skill}
                    </span>
                  ))}
                </div>
                <button className="w-full py-2.5 rounded-lg bg-white text-black font-bold text-sm flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" /> Apply Now
                </button>
              </motion.div>
            </div>

            {/* Right side: Text content */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                Designed for <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Smooth Interaction.</span>
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Experience a platform that feels like it was built for you. Fast, fluid, and intuitive.
              </p>
              
              <ul className="space-y-4 mt-6">
                {[
                  { title: "Smart Matching", desc: "Find skills your team lacks." },
                  { title: "Real-time Chat", desc: "Instant messaging with teammates." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{item.title}</h4>
                      <p className="text-slate-400 text-xs">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_center,rgba(99,102,241,0.2),transparent_70%)] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center relative z-10 border border-indigo-500/20 bg-background/60 backdrop-blur-2xl rounded-[2rem] p-12 sm:p-16 shadow-[0_0_80px_rgba(99,102,241,0.1)] overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-4 tracking-tight relative z-10">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Launch?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto font-medium relative z-10">
            Join the network of builders. Your next big opportunity is one connection away.
          </p>
          
          <Link 
            href="/auth"
            className="relative group inline-flex items-center justify-center px-10 py-5 rounded-xl font-black text-white text-lg transition-all duration-300 hover:scale-105 z-10"
          >
            <span className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-100 shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300" />
            <span className="relative flex items-center gap-3">
              Get Started for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </span>
          </Link>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-6 tracking-tight">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Touch.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Have questions or want to partner? Reach out directly.
          </p>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <motion.div 
              whileHover={{ y: -3 }}
              className="glass p-3 sm:p-6 rounded-xl border border-white/10 flex flex-col items-center gap-2 group text-center"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Email Us</h3>
              <p className="text-[10px] sm:text-xs text-indigo-400 font-medium truncate w-full">shubhamoy27@gmail.com</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -3 }}
              className="glass p-3 sm:p-6 rounded-xl border border-white/10 flex flex-col items-center gap-2 group text-center"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Call Us</h3>
              <p className="text-[10px] sm:text-xs text-purple-400 font-medium">+91 91444 57475</p>
            </motion.div>
          </div>
        </div>
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
                <li><Link href="#contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} CollabX. Built with ❤️ by Shubhamoy.
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
