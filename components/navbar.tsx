"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { User, LogOut, Menu } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
  const user = null // For now, always show login buttons
  const loading = false

  return (
    <nav className="fixed top-4 left-4 right-4 z-50">
      <div className="mx-auto max-w-7xl">
        <div className="bg-green-900/80 backdrop-blur-md rounded-2xl border border-green-700/30 shadow-lg">
          <div className="flex h-16 items-center justify-between px-6">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/images/pexeso-logo.png" alt="Pexeso Logo" width={32} height={32} className="h-8 w-8" />
              <span className="text-xl font-bold text-white">PexesoAI</span>
            </Link>

            <div className="flex items-center space-x-2">
              {!loading && (
                <>
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-green-800/50 rounded-full h-10 w-10"
                        >
                          <User className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-green-900/95 backdrop-blur-md border-green-700/30 text-white"
                      >
                        <DropdownMenuItem className="cursor-pointer text-red-400 hover:bg-green-800/50 focus:bg-green-800/50">
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Link href="/auth">
                        <Button
                          variant="ghost"
                          className="text-white hover:bg-green-800/50 border border-green-700/50 rounded-lg px-4 py-2 h-10 transition-all duration-200"
                        >
                          Log in
                        </Button>
                      </Link>
                      <Link href="/auth">
                        <Button className="bg-white text-green-900 hover:bg-green-50 rounded-lg px-4 py-2 h-10 font-medium transition-all duration-200">
                          Get started
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}

              <Button variant="ghost" size="icon" className="text-white hover:bg-green-800/50 rounded-full h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
