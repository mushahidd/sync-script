"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, BookOpen, Link2, Shield, CheckCircle2, Wand2 } from "lucide-react";

export default function AICitationPage() {
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
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight">
              <span className="gradient-text">AI Citation Engine</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Automatically generate accurate citations in any format. Verify sources and maintain academic integrity with AI-powered intelligence.
            </p>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">How AI Citations Work</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Wand2 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Auto-Extract Metadata</CardTitle>
                  <CardDescription>
                    Our AI automatically extracts citation metadata from your sources—including author names, publication dates, journal titles, DOIs, and ISBNs. No manual data entry required.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Multi-Format Support</CardTitle>
                  <CardDescription>
                    Generate citations in APA, MLA, Chicago, Harvard, IEEE, and 9,000+ other citation styles. Switch between formats instantly without reformatting.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Source Verification</CardTitle>
                  <CardDescription>
                    AI validates source authenticity by cross-referencing with academic databases, checking DOIs, and verifying publication details to ensure citation accuracy.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Link2 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Smart Organization</CardTitle>
                  <CardDescription>
                    Sources are organized within knowledge vaults with automatic categorization. Tag sources by topic, generate bibliographies, and export citation lists in seconds.
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
            <h2 className="text-3xl font-bold mb-8 text-center">Citation Features</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {[
                    "9,000+ citation styles - APA, MLA, Chicago, Harvard, IEEE, and more",
                    "PDF metadata extraction - Pull citation info directly from uploaded papers",
                    "URL to citation - Convert web pages and articles to proper citations",
                    "DOI/ISBN lookup - Automatically fetch complete citation details",
                    "In-text citations - Generate both full references and in-text citations",
                    "Bibliography export - Download formatted bibliographies in Word/PDF",
                    "Duplicate detection - Identify and merge duplicate source entries",
                    "Citation analytics - Track most-cited sources in your vaults"
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

          {/* AI-Powered Intelligence */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">AI-Powered Intelligence</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card hover>
                <CardHeader>
                  <Sparkles className="w-8 h-8 text-primary mb-3" />
                  <CardTitle>Smart Suggestions</CardTitle>
                  <CardDescription>
                    AI suggests related sources based on your current research, helping you discover relevant citations you might have missed. Build comprehensive bibliographies faster.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card hover>
                <CardHeader>
                  <Shield className="w-8 h-8 text-primary mb-3" />
                  <CardTitle>Quality Assurance</CardTitle>
                  <CardDescription>
                    Detect potential citation errors, broken links, and missing required fields. AI flags inconsistent formatting and suggests corrections to maintain academic standards.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card hover>
                <CardHeader>
                  <BookOpen className="w-8 h-8 text-primary mb-3" />
                  <CardTitle>Context Awareness</CardTitle>
                  <CardDescription>
                    AI understands citation context—whether you need a journal article, book chapter, or conference paper format. Automatically applies the correct template for each source type.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card hover>
                <CardHeader>
                  <Wand2 className="w-8 h-8 text-primary mb-3" />
                  <CardTitle>Batch Processing</CardTitle>
                  <CardDescription>
                    Upload multiple sources at once and let AI generate citations for all of them simultaneously. Process hundreds of sources in minutes instead of hours.
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
                  <CardTitle className="text-lg">Academic Writing</CardTitle>
                  <CardDescription>
                    Maintain proper citation standards for dissertations, theses, and research papers. Ensure compliance with institutional style guides effortlessly.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card hover>
                <CardHeader>
                  <CardTitle className="text-lg">Literature Reviews</CardTitle>
                  <CardDescription>
                    Manage large bibliographies across systematic reviews. Track citations, organize by theme, and generate formatted reference lists instantly.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card hover>
                <CardHeader>
                  <CardTitle className="text-lg">Team Research</CardTitle>
                  <CardDescription>
                    Centralize team citations in shared vaults. Everyone uses the same verified sources with consistent formatting across all documents.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </motion.div>

          {/* Academic Integrity */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-16"
          >
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-8 h-8 text-primary" />
                  <CardTitle className="text-2xl">Academic Integrity First</CardTitle>
                </div>
                <CardDescription className="text-base">
                  SyncScript's AI Citation Engine is built with academic integrity at its core. We verify sources against trusted databases, detect potential plagiarism flags, and ensure citations meet rigorous academic standards. Your research credibility matters to us.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-200">Source Authentication</p>
                      <p className="text-sm text-slate-400">Verify sources are real and properly formatted</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-200">Plagiarism Detection</p>
                      <p className="text-sm text-slate-400">Flag suspicious citation patterns</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                <h3 className="text-2xl font-bold mb-4">Generate Perfect Citations with AI</h3>
                <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                  Let AI handle your citations so you can focus on research. Join researchers who trust SyncScript for academic integrity.
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
