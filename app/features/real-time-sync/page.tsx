"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Zap, Users, Bell, Globe, CheckCircle2 } from "lucide-react";

export default function RealTimeSyncPage() {
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
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
              <Zap className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight">
              <span className="gradient-text">Real-Time Sync</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Collaborate seamlessly with your research team. See changes instantly as everyone contributes to knowledge vaults together.
            </p>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">How Real-Time Sync Works</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Instant Updates</CardTitle>
                  <CardDescription>
                    Every change made by team members—whether it's adding a source, uploading a PDF, or creating an annotation—is instantly synchronized across all connected devices using Pusher real-time technology.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Bell className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Live Notifications</CardTitle>
                  <CardDescription>
                    Get notified immediately when collaborators update shared vaults. Stay informed about new sources, comments, and research additions without refreshing the page.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Multi-User Collaboration</CardTitle>
                  <CardDescription>
                    Invite team members to your knowledge vaults. Everyone can contribute simultaneously, and changes are merged seamlessly without conflicts or data loss.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Lightning Fast</CardTitle>
                  <CardDescription>
                    Built on WebSocket technology for sub-second latency. Changes propagate to all team members instantly, creating a truly collaborative research experience.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {[
                    "Live vault updates - See new sources and PDFs appear instantly",
                    "Real-time annotation sync - View team annotations as they're created",
                    "Collaborative editing - Multiple users can work simultaneously",
                    "Presence indicators - Know who's currently viewing your vaults",
                    "Automatic conflict resolution - No more merge conflicts",
                    "Offline support - Changes sync when you reconnect"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Use Cases */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Perfect For</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <Card hover>
                <CardHeader>
                  <CardTitle className="text-lg">Research Teams</CardTitle>
                  <CardDescription>
                    Coordinate large-scale research projects with distributed teams working across different time zones.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card hover>
                <CardHeader>
                  <CardTitle className="text-lg">Academic Groups</CardTitle>
                  <CardDescription>
                    Collaborate on literature reviews, thesis projects, and group assignments with instant visibility.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card hover>
                <CardHeader>
                  <CardTitle className="text-lg">Knowledge Bases</CardTitle>
                  <CardDescription>
                    Build and maintain living documentation that stays current with contributions from entire organizations.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-8 pb-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Collaborate in Real-Time?</h3>
                <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                  Join thousands of researchers who are building knowledge vaults together with instant synchronization.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard">
                    <Button size="lg">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button size="lg" variant="secondary">
                      Explore Other Features
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
