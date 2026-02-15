"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Github, Linkedin } from "lucide-react";

export default function ContactPage() {
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

      {/* Contact Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight">
              <span className="gradient-text">Connect With Us</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Have questions or want to collaborate? We'd love to hear from you. Reach out through any of these channels.
            </p>
          </motion.div>

          {/* Contact Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* GitHub */}
            <Card hover className="group cursor-pointer">
              <a href="https://github.com/mushahidd" target="_blank" rel="noopener noreferrer" className="block">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                    <Github className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>GitHub</CardTitle>
                  <CardDescription>
                    Check out our code and contribute to the project on GitHub.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-primary font-medium">@mushahidd</p>
                </CardContent>
              </a>
            </Card>

            {/* LinkedIn */}
            <Card hover className="group cursor-pointer">
              <a href="https://www.linkedin.com/in/mushahid19/" target="_blank" rel="noopener noreferrer" className="block">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                    <Linkedin className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>LinkedIn</CardTitle>
                  <CardDescription>
                    Connect with us professionally on LinkedIn for updates and networking.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-primary font-medium">mushahid19</p>
                </CardContent>
              </a>
            </Card>

            {/* Email */}
            <Card hover className="group cursor-pointer">
              <a href="mailto:mushahidhussain451@gmail.com" className="block">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Email</CardTitle>
                  <CardDescription>
                    Send us an email for inquiries, support, or collaboration opportunities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-primary font-medium break-all">mushahidhussain451@gmail.com</p>
                </CardContent>
              </a>
            </Card>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-8 pb-8">
                <h3 className="text-2xl font-bold mb-4">Looking to Get Started?</h3>
                <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                  Join SyncScript today and start building knowledge vaults with your research team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button size="lg">
                      Create Account
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button size="lg" variant="secondary">
                      Learn More
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
