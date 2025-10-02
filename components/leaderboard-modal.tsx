"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Clock, Target, Zap } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"

interface LeaderboardEntry {
  id: string
  user_id: string
  final_score: number
  time_taken: number
  pairs_matched: number
  mistakes: number
  created_at: string
  user: {
    username: string
    avatar_url?: string
  }
}

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [leaderboardData, setLeaderboardData] = useState<{
    topScores: LeaderboardEntry[]
    fastestTimes: LeaderboardEntry[]
    mostPairs: LeaderboardEntry[]
  }>({
    topScores: [],
    fastestTimes: [],
    mostPairs: [],
  })
  const [loading, setLoading] = useState(true)
  const t = useTranslations("leaderboard")

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard()
    }
  }, [isOpen])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/leaderboard")
      if (response.ok) {
        const data = await response.json()
        setLeaderboardData(data)
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 2:
        return <Award className="h-6 w-6 text-amber-700" />
      default:
        return <span className="text-gray-400 font-bold">{index + 1}</span>
    }
  }

  const renderLeaderboardList = (entries: LeaderboardEntry[], type: "score" | "time" | "pairs") => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-gray-800/50 border-gray-600/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (entries.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          <p>{t("noData")}</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <Card
            key={entry.id}
            className={`bg-gray-800/50 border-gray-600/30 transition-all hover:bg-gray-700/50 ${
              index < 3 ? "ring-2 ring-primary/20" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10">{getMedalIcon(index)}</div>

                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {entry.user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="text-white font-medium">{entry.user.username}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    {type === "score" && (
                      <>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {entry.final_score} {t("points")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {entry.pairs_matched} {t("pairs")}
                        </span>
                      </>
                    )}
                    {type === "time" && (
                      <>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(entry.time_taken)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {entry.pairs_matched} {t("pairs")}
                        </span>
                      </>
                    )}
                    {type === "pairs" && (
                      <>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {entry.pairs_matched} {t("pairs")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {entry.final_score} {t("points")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {type === "score" && <div className="text-lg font-bold text-green-400">{entry.final_score}</div>}
                  {type === "time" && (
                    <div className="text-lg font-bold text-blue-400">{formatTime(entry.time_taken)}</div>
                  )}
                  {type === "pairs" && <div className="text-lg font-bold text-purple-400">{entry.pairs_matched}</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 border-gray-700/30 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="score" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
            <TabsTrigger
              value="score"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              <Zap className="h-4 w-4 mr-2" />
              {t("topScores")}
            </TabsTrigger>
            <TabsTrigger value="time" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <Clock className="h-4 w-4 mr-2" />
              {t("fastestTimes")}
            </TabsTrigger>
            <TabsTrigger
              value="pairs"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <Target className="h-4 w-4 mr-2" />
              {t("mostPairs")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="score" className="mt-4">
            {renderLeaderboardList(leaderboardData.topScores, "score")}
          </TabsContent>

          <TabsContent value="time" className="mt-4">
            {renderLeaderboardList(leaderboardData.fastestTimes, "time")}
          </TabsContent>

          <TabsContent value="pairs" className="mt-4">
            {renderLeaderboardList(leaderboardData.mostPairs, "pairs")}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
