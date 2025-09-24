"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Star,
  CheckCircle,
  Sparkles,
  NotebookPen,
  Globe,
  Lock,
  PenTool,
  Coffee,
  Heart,
  BookOpen,
  Feather,
  Brain,
} from "lucide-react"

function FloatingNotebook() {
  return (
    <div className="relative w-56 h-72 sm:w-64 sm:h-80 md:w-72 md:h-88 lg:w-80 lg:h-96 mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-card via-card/80 to-card/60 rounded-2xl sm:rounded-3xl shadow-2xl transform rotate-3 sm:rotate-6 hover:rotate-2 sm:hover:rotate-3 transition-all duration-500 border border-border/30 animate-float backdrop-blur-sm">
        <div className="p-4 sm:p-6">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full mr-2 sm:mr-3 animate-pulse shadow-lg"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full mr-2 sm:mr-3 animate-pulse delay-100 shadow-lg"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-pulse delay-200 shadow-lg"></div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="h-4 sm:h-5 bg-gradient-to-r from-primary/30 to-primary/20 rounded-lg animate-pulse shadow-sm"></div>
            <div className="h-3 sm:h-4 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/30 rounded w-3/4 animate-pulse delay-100 shadow-sm"></div>
            <div className="h-3 sm:h-4 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/30 rounded w-1/2 animate-pulse delay-200 shadow-sm"></div>
            <div className="h-4 sm:h-5 bg-gradient-to-r from-primary/30 to-primary/20 rounded-lg w-5/6 animate-pulse delay-300 shadow-sm"></div>
            <div className="h-3 sm:h-4 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/30 rounded w-2/3 animate-pulse delay-400 shadow-sm"></div>
            <div className="h-3 sm:h-4 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/30 rounded w-4/5 animate-pulse delay-500 shadow-sm"></div>
          </div>
        </div>
      </div>
      <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 rounded-full flex items-center justify-center shadow-2xl animate-bounce border border-border/20">
        <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-primary animate-pulse" />
      </div>
      <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 rounded-full flex items-center justify-center shadow-xl animate-bounce delay-1000 border border-border/20">
        <Star className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-pulse" />
      </div>
    </div>
  )
}

function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", updateMousePosition)
    return () => window.removeEventListener("mousemove", updateMousePosition)
  }, [])

  return mousePosition
}

export function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const mousePosition = useMousePosition()

  const fullText = "Write, Share, and Collaborate"
  const typingSpeed = 100

  useEffect(() => {
    setMounted(true)
    
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, typingSpeed)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, fullText])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20 sm:opacity-30 dark:opacity-10 dark:sm:opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Dynamic Background Orbs - Optimized for mobile */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-primary/10 rounded-full blur-2xl sm:blur-3xl animate-pulse transition-all duration-2000 ease-out"
          style={{
            left: `${isMobile ? mousePosition.x * 0.005 : mousePosition.x * 0.01}px`,
            top: `${isMobile ? mousePosition.y * 0.005 + 50 : mousePosition.y * 0.01 + 100}px`,
          }}
        ></div>
        <div
          className="absolute w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-primary/8 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-1000 transition-all duration-2000 ease-out"
          style={{
            right: `${isMobile ? (typeof window !== 'undefined' ? window.innerWidth - mousePosition.x : 0) * 0.004 : (typeof window !== 'undefined' ? window.innerWidth - mousePosition.x : 0) * 0.008}px`,
            top: `${isMobile ? mousePosition.y * 0.006 + 100 : mousePosition.y * 0.012 + 200}px`,
          }}
        ></div>
        <div className="absolute bottom-16 sm:bottom-20 left-1/4 w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-primary/6 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-32 sm:bottom-40 right-1/3 w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-primary/8 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-3000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-primary/5 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-4000"></div>
      </div>

      {/* Enhanced Floating Elements - Hidden on mobile for performance */}
      <div className="absolute inset-0 -z-5 pointer-events-none hidden sm:block">
        <div className="absolute top-32 left-20 animate-float">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-2xl md:rounded-3xl rotate-12 shadow-2xl backdrop-blur-md border border-border/20 hover:scale-110 transition-all duration-500 group cursor-pointer">
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-primary group-hover:text-primary/80 transition-colors duration-300" />
            </div>
          </div>
        </div>
        <div className="absolute top-48 right-32 animate-float-delayed">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-xl md:rounded-2xl -rotate-12 shadow-2xl backdrop-blur-md border border-border/20 hover:scale-110 transition-all duration-500 group cursor-pointer">
            <div className="w-full h-full flex items-center justify-center">
              <Brain className="w-6 h-6 md:w-8 md:h-8 text-primary group-hover:text-primary/80 transition-colors duration-300" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-32 left-1/3 animate-float-slow">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-2xl md:rounded-3xl rotate-45 shadow-2xl backdrop-blur-md border border-border/20 hover:scale-110 transition-all duration-500 group cursor-pointer">
            <div className="w-full h-full flex items-center justify-center">
              <Feather className="w-10 h-10 md:w-12 md:h-12 text-primary group-hover:text-primary/80 transition-colors duration-300" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-48 right-20 animate-float-delayed-slow">
          <div className="w-14 h-14 md:w-18 md:h-18 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-xl md:rounded-2xl -rotate-45 shadow-2xl backdrop-blur-md border border-border/20 hover:scale-110 transition-all duration-500 group cursor-pointer">
            <div className="w-full h-full flex items-center justify-center">
              <Star className="w-7 h-7 md:w-9 md:h-9 text-primary group-hover:text-primary/80 transition-colors duration-300" />
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-10 animate-float">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-xl md:rounded-2xl rotate-45 shadow-2xl backdrop-blur-md border border-border/20 hover:scale-110 transition-all duration-500 group cursor-pointer">
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:text-primary/80 transition-colors duration-300" />
            </div>
          </div>
        </div>
        <div className="absolute top-20 right-1/4 animate-float-delayed">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-lg md:rounded-xl -rotate-12 shadow-2xl backdrop-blur-md border border-border/20 hover:scale-110 transition-all duration-500 group cursor-pointer">
            <div className="w-full h-full flex items-center justify-center">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:text-primary/80 transition-colors duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center min-h-[60vh]">
            {/* Left Side - Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-primary/10 via-primary/10 to-primary/10 text-primary text-xs sm:text-sm font-semibold mb-6 sm:mb-8 border border-border/20 shadow-2xl backdrop-blur-md hover:shadow-3xl hover:scale-105 transition-all duration-500">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 animate-spin text-primary" />
                  <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Collaborative Note-Taking Made Simple
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                  <span className="inline-block bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-gradient-x">
                    {displayedText}
                    <span className="animate-pulse text-primary">|</span>
                  </span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl lg:max-w-none leading-relaxed animate-fade-in-up delay-1000 font-medium">
                  Create, organize, and collaborate on notes in real-time with our beautiful, intuitive interface.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start items-center animate-fade-in-up delay-2000">
                  <Button
                    
                    asChild
                   
                  >
                    <Link href="/signup" className="flex items-center justify-center">
                      <PenTool className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                      Start Writing Now
                      <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    
                    asChild
                    
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side - Floating Notebook */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="animate-fade-in-up delay-500">
                <FloatingNotebook />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-muted/30 via-background to-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 animate-fade-in-up bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent px-4">
              Everything you need to stay organized
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl sm:max-w-3xl mx-auto animate-fade-in-up delay-300 font-medium px-4">
              Powerful features designed to enhance your productivity and collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Card className="group hover:shadow-3xl transition-all duration-500 border border-border/50 hover:border-primary/30 hover:-translate-y-2 sm:hover:-translate-y-3 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-md hover:bg-gradient-to-br hover:from-card/90 hover:via-primary/5 hover:to-primary/10">
              <CardHeader className="p-4 sm:p-6 md:p-8">
                <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-xl sm:rounded-2xl w-fit mb-4 sm:mb-6 group-hover:from-primary/30 group-hover:via-primary/25 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xl">
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold group-hover:text-primary transition-colors duration-300 mb-2 sm:mb-3">
                  Rich Text Editor
                </CardTitle>
                <CardDescription className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Create beautiful notes with our intuitive editor. Format text, add links, and organize your thoughts
                  effortlessly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-3xl transition-all duration-500 border border-border/50 hover:border-primary/30 hover:-translate-y-2 sm:hover:-translate-y-3 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-md hover:bg-gradient-to-br hover:from-card/90 hover:via-primary/5 hover:to-primary/10">
              <CardHeader className="p-4 sm:p-6 md:p-8">
                <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-xl sm:rounded-2xl w-fit mb-4 sm:mb-6 group-hover:from-primary/30 group-hover:via-primary/25 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xl">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold group-hover:text-primary transition-colors duration-300 mb-2 sm:mb-3">
                  Real-time Collaboration
                </CardTitle>
                <CardDescription className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Work together seamlessly. See changes in real-time as your team members edit notes simultaneously.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-3xl transition-all duration-500 border border-border/50 hover:border-primary/30 hover:-translate-y-2 sm:hover:-translate-y-3 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-md hover:bg-gradient-to-br hover:from-card/90 hover:via-primary/5 hover:to-primary/10">
              <CardHeader className="p-4 sm:p-6 md:p-8">
                <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-xl sm:rounded-2xl w-fit mb-4 sm:mb-6 group-hover:from-primary/30 group-hover:via-primary/25 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xl">
                  <Zap className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold group-hover:text-primary transition-colors duration-300 mb-2 sm:mb-3">
                  Lightning Fast
                </CardTitle>
                <CardDescription className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Built for speed. Your notes sync instantly across all devices with our optimized infrastructure.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-3xl transition-all duration-500 border border-border/50 hover:border-primary/30 hover:-translate-y-2 sm:hover:-translate-y-3 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-md hover:bg-gradient-to-br hover:from-card/90 hover:via-primary/5 hover:to-primary/10">
              <CardHeader className="p-4 sm:p-6 md:p-8">
                <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-xl sm:rounded-2xl w-fit mb-4 sm:mb-6 group-hover:from-primary/30 group-hover:via-primary/25 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xl">
                  <Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold group-hover:text-primary transition-colors duration-300 mb-2 sm:mb-3">
                  Secure & Private
                </CardTitle>
                <CardDescription className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Your data is protected with enterprise-grade security. End-to-end encryption keeps your notes safe.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-3xl transition-all duration-500 border border-border/50 hover:border-primary/30 hover:-translate-y-2 sm:hover:-translate-y-3 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-md hover:bg-gradient-to-br hover:from-card/90 hover:via-primary/5 hover:to-primary/10">
              <CardHeader className="p-4 sm:p-6 md:p-8">
                <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-xl sm:rounded-2xl w-fit mb-4 sm:mb-6 group-hover:from-primary/30 group-hover:via-primary/25 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xl">
                  <Globe className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold group-hover:text-primary transition-colors duration-300 mb-2 sm:mb-3">
                  Cross-Platform
                </CardTitle>
                <CardDescription className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Access your notes anywhere. Works perfectly on desktop, tablet, and mobile devices.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-3xl transition-all duration-500 border border-border/50 hover:border-primary/30 hover:-translate-y-2 sm:hover:-translate-y-3 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-md hover:bg-gradient-to-br hover:from-card/90 hover:via-primary/5 hover:to-primary/10">
              <CardHeader className="p-4 sm:p-6 md:p-8">
                <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-xl sm:rounded-2xl w-fit mb-4 sm:mb-6 group-hover:from-primary/30 group-hover:via-primary/25 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xl">
                  <Lock className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold group-hover:text-primary transition-colors duration-300 mb-2 sm:mb-3">
                  Organize with Folders
                </CardTitle>
                <CardDescription className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Keep your notes organized with custom folders. Find what you need instantly with powerful search.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/4 w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-primary/5 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-primary/3 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 right-1/3 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-primary/4 rounded-full blur-xl sm:blur-2xl animate-pulse delay-2000"></div>
        </div>

        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center relative">
          <div className="animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent px-4">
              Ready to transform your note-taking?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
              Join thousands of users who have already improved their productivity with NotesApp
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-10 md:mb-12 px-4">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/signup" className="flex items-center justify-center">
                  <Coffee className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Create Your Account
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 md:space-x-8 text-xs sm:text-sm text-muted-foreground px-4">
              <div className="flex items-center animate-fade-in-up delay-500">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 animate-pulse" />
                Free to get started
              </div>
              <div className="flex items-center animate-fade-in-up delay-700">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 animate-pulse" />
                No credit card required
              </div>
              <div className="flex items-center animate-fade-in-up delay-1000">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 animate-pulse" />
                Setup in 2 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-gradient-to-r from-muted/20 via-background to-muted/20 py-8 sm:py-10 md:py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 md:mb-0 group">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg sm:rounded-xl group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                <NotebookPen className="h-5 w-5 sm:h-6 sm:w-6 text-primary group-hover:animate-pulse" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                NotesApp
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-6 text-xs sm:text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-primary transition-colors duration-300 hover:scale-105">
                Sign In
              </Link>
              <Link href="/signup" className="hover:text-primary transition-colors duration-300 hover:scale-105">
                Sign Up
              </Link>
              <span className="text-xs opacity-75">© 2025 NotesApp. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}