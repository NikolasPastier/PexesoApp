"use client"

import { Navbar } from "@/components/navbar"
import { DeckUploader } from "@/components/deck-uploader"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Trash2, Play, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  username: string
  email: string
  avatar_url?: string
  rank: string
  xp: number
  created_at: string
}

interface UserDeck {
  id: string
  title: string
  images: any[]
  is_public: boolean
  created_at: string
}

interface GameHistory {
  id: string
  mode: string
  status: string
  created_at: string
  final_score?: number
  pairs_matched?: number
  time_taken?: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userDecks, setUserDecks] = useState<UserDeck[]>([])
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      setUser(user)

      // Fetch user profile
      const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (profile) {
        setUserProfile(profile)
      }

      // Fetch user decks
      const { data: decks } = await supabase
        .from("decks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (decks) {
        setUserDecks(decks)
      }

      // Fetch game history with scores
      const { data: games } = await supabase
        .from("games")
        .select(`
          *,
          scores (
            final_score,
            pairs_matched,
            time_taken
          )
        `)
        .contains("players", [{ id: user.id }])
        .order("created_at", { ascending: false })
        .limit(10)

      if (games) {
        setGameHistory(games)
      }

      setLoading(false)
    }

    getUser()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* User Info Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={userProfile.avatar_url || "/placeholder.svg"} alt={userProfile.username} />
                  <AvatarFallback>{userProfile.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-2">{userProfile.username}</h1>
                  <p className="text-muted-foreground mb-2">{userProfile.email}</p>
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                    {userProfile.rank} • {userProfile.xp} XP
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{gameHistory.length}</div>
                      <div className="text-sm text-muted-foreground">Games Played</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {Math.max(...gameHistory.map((g) => g.scores?.[0]?.final_score || 0), 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Best Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{userDecks.length}</div>
                      <div className="text-sm text-muted-foreground">Decks Created</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="decks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="decks">My Decks</TabsTrigger>
            <TabsTrigger value="games">Game History</TabsTrigger>
            <TabsTrigger value="create">Create Deck</TabsTrigger>
          </TabsList>

          <TabsContent value="decks" className="space-y-4">
            <div className="grid gap-4">
              {userDecks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No decks created yet. Create your first deck!</p>
                  </CardContent>
                </Card>
              ) : (
                userDecks.map((deck) => (
                  <Card key={deck.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-card-foreground">{deck.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {deck.images?.length || 0} cards • {deck.is_public ? "Public" : "Private"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Play className="w-4 h-4 mr-1" />
                            Play
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="games" className="space-y-4">
            <div className="grid gap-4">
              {gameHistory.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No games played yet. Start your first game!</p>
                  </CardContent>
                </Card>
              ) : (
                gameHistory.map((game) => (
                  <Card key={game.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-card-foreground">{game.mode} Mode</h3>
                          <p className="text-sm text-muted-foreground">
                            Score: {game.scores?.[0]?.final_score || 0} • Pairs: {game.scores?.[0]?.pairs_matched || 0}{" "}
                            •{new Date(game.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            game.status === "completed"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {game.status === "completed" ? "✓ Complete" : "○ Incomplete"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <DeckUploader />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
