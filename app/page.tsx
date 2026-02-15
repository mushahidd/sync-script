"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Zap, FileText, Sparkles, ArrowRight, Users, Github, Linkedin, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPapers: 0,
    totalVaults: 0,
    totalAnnotations: 0,
  });

  // Fetch real stats
  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Stats API error:", data.error);
          // Keep default values on error
          return;
        }
        setStats(data);
      })
      .catch((err) => {
        console.error("Error fetching stats:", err);
        // Keep default values on error
      });
  }, []);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);
  return (
    <main className="min-h-screen noise-bg">
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 w-full z-50 glass glass-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Image 
              src="/logo.png" 
              alt="SyncScript" 
              width={32} 
              height={32}
              className="object-contain sm:w-10 sm:h-10"
            />
            <span className="font-bold text-lg sm:text-xl">SyncScript</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-primary">AI-Powered Research Platform</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight">
              Build Knowledge
              <br />
              <span className="gradient-text">Vaults Together</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
              Real-time collaboration, verified sources, AI-powered citations. 
              The modern way to organize research and build collective knowledge.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/dashboard">
                <Button size="lg" className="group">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            id="features"
            variants={container}
            initial="hidden"
            animate="show"
            className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-24 px-4"
          >
            <motion.div variants={item}>
              <Card hover className="h-full group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Real-Time Sync</CardTitle>
                  <CardDescription>
                    Collaborate seamlessly with your team. See changes instantly as you build knowledge together.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/features/real-time-sync" className="inline-block">
                    <div className="flex items-center text-sm text-primary font-medium cursor-pointer">
                      Learn more
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card hover className="h-full group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>PDF Annotations</CardTitle>
                  <CardDescription>
                    Highlight, comment, and organize insights directly on PDFs. Share annotations with your team.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/features/pdf-annotations" className="inline-block">
                    <div className="flex items-center text-sm text-primary font-medium cursor-pointer">
                      Learn more
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card hover className="h-full group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>AI Citation Engine</CardTitle>
                  <CardDescription>
                    Automatically generate citations in any format. Verify sources and maintain academic integrity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/features/ai-citations" className="inline-block">
                    <div className="flex items-center text-sm text-primary font-medium cursor-pointer">
                      Learn more
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-12 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 px-4"
          >
            {[
              { value: (stats.totalUsers || 0).toString(), label: "Active Users" },
              { value: (stats.totalPapers || 0).toString(), label: "Research Papers" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Support" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-xs sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
            {/* Platform Features */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-slate-200">Platform</h3>
              </div>
              <ul className="space-y-3">
                <li>
                  <Link href="/features/real-time-sync" className="text-slate-400 hover:text-primary transition-all text-sm hover:translate-x-1 inline-block">
                    Real-Time Collaboration
                  </Link>
                </li>
                <li>
                  <Link href="/features/pdf-annotations" className="text-slate-400 hover:text-primary transition-all text-sm hover:translate-x-1 inline-block">
                    PDF Annotations
                  </Link>
                </li>
                <li>
                  <Link href="/features/ai-citations" className="text-slate-400 hover:text-primary transition-all text-sm hover:translate-x-1 inline-block">
                    AI Citations
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-slate-400 hover:text-primary transition-all text-sm hover:translate-x-1 inline-block">
                    Knowledge Vaults
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Researchers */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-slate-200">For Researchers</h3>
              </div>
              <ul className="space-y-3">
                <li>
                  <Link href="/dashboard" className="text-slate-400 hover:text-primary transition-all text-sm hover:translate-x-1 inline-block">
                    Research Teams
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-slate-400 hover:text-primary transition-all text-sm hover:translate-x-1 inline-block">
                    Academic Groups
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-slate-400 hover:text-primary transition-all text-sm hover:translate-x-1 inline-block">
                    Literature Review
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-slate-400 hover:text-primary transition-all text-sm hover:translate-x-1 inline-block">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-slate-200">Community</h3>
              </div>
              <div className="flex gap-3">
                <a 
                  href="https://github.com/mushahidd" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-primary/20 border border-slate-700 hover:border-primary/50 flex items-center justify-center transition-all hover:scale-110 group"
                >
                  <Github className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/mushahid19/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-primary/20 border border-slate-700 hover:border-primary/50 flex items-center justify-center transition-all hover:scale-110 group"
                >
                  <Linkedin className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                </a>
                <a 
                  href="mailto:mushahidhussain451@gmail.com" 
                  className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-primary/20 border border-slate-700 hover:border-primary/50 flex items-center justify-center transition-all hover:scale-110 group"
                >
                  <Mail className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                </a>
              </div>
            </div>
          </div>

          {/* Get in Touch Card */}
          <div className="pt-8 border-t border-slate-800 mb-12">
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2 gradient-text">Get in Touch</h3>
                    <p className="text-slate-400">Have questions or want to collaborate? We'd love to hear from you.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link href="/contact">
                      <Button size="lg" className="group">
                        Contact Us
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Image 
                src="/logo.png" 
                alt="SyncScript" 
                width={32} 
                height={32}
                className="object-contain"
              />
              <span className="font-bold text-lg">SyncScript</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm text-center md:text-left">
              © 2026 SyncScript. Built for researchers, by researchers.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
