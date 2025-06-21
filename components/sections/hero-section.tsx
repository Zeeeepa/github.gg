"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { FadeIn, SlideIn, ScaleIn } from "@/components/animated-elements"
import AnimatedText from "@/components/animated-text"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 py-20">
      <div className="container max-w-6xl mx-auto text-center">
        <FadeIn>
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2 px-8 py-4 rounded-full border border-border/50 bg-background/10 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">AI-Powered GitHub Analysis</span>
            </div>
          </div>
        </FadeIn>

        <SlideIn direction="up" delay={0.1}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <AnimatedText
              text="GitHub"
              className="text-white"
              delay={0.2}
            />
            <span className="text-primary">.</span>
            <AnimatedText
              text="GG"
              className="text-primary"
              delay={0.4}
            />
          </h1>
        </SlideIn>

        <SlideIn direction="up" delay={0.3}>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Enhanced GitHub experience with AI-powered insights, advanced repository analysis, 
            and intelligent code exploration tools.
          </p>
        </SlideIn>

        <SlideIn direction="up" delay={0.5}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
              <Link href="/explore">
                <Github className="mr-2 h-5 w-5" />
                Explore Repositories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto" asChild>
              <Link href="/login">
                Sign in with GitHub
              </Link>
            </Button>
          </div>
        </SlideIn>

        <ScaleIn delay={0.7}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div 
              className="text-center p-10 rounded-4xl border border-border/50 bg-background/5 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl font-bold text-primary mb-2">3.2M+</div>
              <div className="text-muted-foreground">Repositories Analyzed</div>
            </motion.div>
            <motion.div 
              className="text-center p-10 rounded-4xl border border-border/50 bg-background/5 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl font-bold text-primary mb-2">24K+</div>
              <div className="text-muted-foreground">Active Users</div>
            </motion.div>
            <motion.div 
              className="text-center p-10 rounded-4xl border border-border/50 bg-background/5 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl font-bold text-primary mb-2">1.2B+</div>
              <div className="text-muted-foreground">Lines of Code Processed</div>
            </motion.div>
          </div>
        </ScaleIn>

        <FadeIn delay={0.9}>
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by developers from leading companies
            </p>
            <div className="flex items-center justify-center gap-8 opacity-50">
              <div className="text-lg font-semibold">GitHub</div>
              <div className="text-lg font-semibold">Microsoft</div>
              <div className="text-lg font-semibold">Google</div>
              <div className="text-lg font-semibold">Meta</div>
              <div className="text-lg font-semibold">Netflix</div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
