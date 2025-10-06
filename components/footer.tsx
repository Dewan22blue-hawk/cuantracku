'use client'

import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full bg-background/80 backdrop-blur-sm border-t border-border p-4 mt-auto">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-1">
          Dibuat dengan <Heart className="w-4 h-4 text-red-500" /> oleh dwncode
        </p>
        <p>&copy; {new Date().getFullYear()} CuanTracku. All rights reserved.</p>
      </div>
    </footer>
  )
}
