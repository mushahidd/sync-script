"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Highlighter, MessageSquare, Share2, CheckCircle2, Eye } from "lucide-react";

export default function PDFAnnotationsPage() {
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
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight">
              <span className="gradient-text">PDF Annotations</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Highlight, comment, and organize insights directly on PDF documents. Share annotations with your team in real-time.
            </p>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">How PDF Annotations Work</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Upload & View PDFs</CardTitle>
                  <CardDescription>
                    Upload research papers, articles, and documents directly to your knowledge vaults. View PDFs instantly in your browser with Cloudinary's secure delivery system—no downloads required.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Highlighter className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Highlight & Tag</CardTitle>
                  <CardDescription>
                    Create annotations on any section of your PDFs. Add highlights with custom colors, tag important passages, and organize your insights with structured metadata.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Add Comments</CardTitle>
                  <CardDescription>
                    Leave detailed comments and notes on specific sections. Build conversations around research findings with threaded discussions that keep context intact.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Share2 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Share with Team</CardTitle>
                  <CardDescription>
                    All annotations are automatically shared with vault collaborators. Team members see your insights in real-time, enabling collaborative analysis and discussion.
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
            <h2 className="text-3xl font-bold mb-8 text-center">Annotation Features</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {[
                    "Rich text annotations - Format comments with markdown support",
                    "Color-coded highlights - Organize by topic, priority, or custom categories",
                    "Page references - Automatically track annotation locations",
                    "Search annotations - Find specific notes across all your PDFs",
                    "Export capabilities - Download PDFs with annotations included",
                    "Version history - Track changes and see annotation evolution",
                    "Private & shared modes - Control visibility of sensitive notes",
                    "Tag system - Categorize and filter annotations efficiently"
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

          {/* Technical Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Built For Research</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card hover>
                <CardHeader>
                  <Eye className="w-8 h-8 text-primary mb-3" />
                  <CardTitle>Secure PDF Viewing</CardTitle>
                  <CardDescription>
                    PDFs are stored securely on Cloudinary with public access mode for seamless viewing. Your documents are encrypted in transit and protected with enterprise-grade security.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card hover>
                <CardHeader>
                  <MessageSquare className="w-8 h-8 text-primary mb-3" />
                  <CardTitle>Persistent Annotations</CardTitle>
                  <CardDescription>
                    All annotations are stored in a PostgreSQL database, ensuring your insights never get lost. Each annotation links to specific page numbers and text selections.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
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
                  <CardTitle className="text-lg">Literature Reviews</CardTitle>
                  <CardDescription>
                    Annotate research papers systematically. Highlight key findings, methodology issues, and important quotes for comprehensive literature analysis.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card hover>
                <CardHeader>
                  <CardTitle className="text-lg">Peer Review</CardTitle>
                  <CardDescription>
                    Provide detailed feedback on manuscripts. Add comments directly on text, suggest revisions, and maintain clear communication with authors.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card hover>
                <CardHeader>
                  <CardTitle className="text-lg">Study Groups</CardTitle>
                  <CardDescription>
                    Collaboratively analyze course materials. Share notes, discuss complex topics, and build collective understanding of difficult concepts.
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
                <h3 className="text-2xl font-bold mb-4">Start Annotating Your Research</h3>
                <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                  Upload your first PDF and experience collaborative annotation with your research team.
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
