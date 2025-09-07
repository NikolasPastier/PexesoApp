"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Users, Bot, ArrowLeft } from "lucide-react"

export default function PlayOptionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Play Style</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Select how you want to challenge your memory today</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Solo Play */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-emerald-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors">
                <User className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Solo Play</CardTitle>
              <CardDescription className="text-gray-600">
                Challenge yourself and improve your memory skills at your own pace
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/play">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Play Solo</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Multiplayer */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-lime-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-lime-100 rounded-full group-hover:bg-lime-200 transition-colors">
                <Users className="h-8 w-8 text-lime-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Multiplayer</CardTitle>
              <CardDescription className="text-gray-600">
                Compete with friends and see who has the better memory
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full bg-lime-600 hover:bg-lime-700 text-white" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Bot Play */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-emerald-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors">
                <Bot className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">vs Bot</CardTitle>
              <CardDescription className="text-gray-600">
                Test your skills against an AI opponent with adjustable difficulty
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500">More game modes and features coming soon!</p>
        </div>
      </div>
    </div>
  )
}
