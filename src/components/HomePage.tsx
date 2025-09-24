'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Lock
} from 'lucide-react'

export function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <NotebookPen className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">NotesApp</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                <Sparkles className="h-4 w-4 mr-2" />
                Collaborative Note-Taking Made Simple
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                Write, Share, and
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"> Collaborate</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                The most intuitive note-taking app for teams and individuals. 
                Create, organize, and collaborate on notes in real-time with beautiful, distraction-free interface.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" asChild className="animate-bounce-in">
                  <Link href="/signup" className="flex items-center">
                    Start Writing Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to enhance your productivity and collaboration
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Rich Text Editor</CardTitle>
                <CardDescription>
                  Create beautiful notes with our intuitive editor. Format text, add links, and organize your thoughts effortlessly.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Real-time Collaboration</CardTitle>
                <CardDescription>
                  Work together seamlessly. See changes in real-time as your team members edit notes simultaneously.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Lightning Fast</CardTitle>
                <CardDescription>
                  Built for speed. Your notes sync instantly across all devices with our optimized infrastructure.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Secure & Private</CardTitle>
                <CardDescription>
                  Your data is protected with enterprise-grade security. End-to-end encryption keeps your notes safe.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Cross-Platform</CardTitle>
                <CardDescription>
                  Access your notes anywhere. Works perfectly on desktop, tablet, and mobile devices.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Organize with Folders</CardTitle>
                <CardDescription>
                  Keep your notes organized with custom folders. Find what you need instantly with powerful search.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Ready to transform your note-taking?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who have already improved their productivity with NotesApp
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild>
                <Link href="/signup" className="flex items-center">
                  Create Your Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Free to get started
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Setup in 2 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="p-2 bg-primary/10 rounded-lg">
                <NotebookPen className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-semibold text-foreground">NotesApp</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
              <span>© 2024 NotesApp. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
