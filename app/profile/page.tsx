import { Navbar } from "@/components/navbar"
import { DeckUploader } from "@/components/deck-uploader"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Trash2, Play } from "lucide-react"

// Mock data
const mockUser = {
  username: "MemoryMaster",
  email: "user@example.com",
  avatar: "/user-avatar.jpg",
  gamesPlayed: 47,
  bestScore: 12,
  decksCreated: 3,
}

const mockUserDecks = [
  { id: "1", title: "My Nature Collection", cardCount: 16, plays: 23 },
  { id: "2", title: "City Landmarks", cardCount: 20, plays: 15 },
  { id: "3", title: "Food & Drinks", cardCount: 12, plays: 8 },
]

const mockGameHistory = [
  { id: "1", deck: "Nature Photography", moves: 18, completed: true, date: "2024-01-15" },
  { id: "2", deck: "Famous Landmarks", moves: 24, completed: true, date: "2024-01-14" },
  { id: "3", deck: "Animal Kingdom", moves: 16, completed: false, date: "2024-01-13" },
]

export default function ProfilePage() {
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
                  <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.username} />
                  <AvatarFallback>MM</AvatarFallback>
                </Avatar>

                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-2">{mockUser.username}</h1>
                  <p className="text-muted-foreground mb-4">{mockUser.email}</p>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{mockUser.gamesPlayed}</div>
                      <div className="text-sm text-muted-foreground">Games Played</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{mockUser.bestScore}</div>
                      <div className="text-sm text-muted-foreground">Best Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{mockUser.decksCreated}</div>
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
              {mockUserDecks.map((deck) => (
                <Card key={deck.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground">{deck.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {deck.cardCount} cards • {deck.plays} plays
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="games" className="space-y-4">
            <div className="grid gap-4">
              {mockGameHistory.map((game) => (
                <Card key={game.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground">{game.deck}</h3>
                        <p className="text-sm text-muted-foreground">
                          {game.moves} moves • {game.completed ? "Completed" : "Incomplete"} • {game.date}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          game.completed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {game.completed ? "✓ Complete" : "○ Incomplete"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
