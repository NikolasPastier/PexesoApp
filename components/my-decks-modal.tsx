"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/modal"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { Pencil, Trash2, Upload, Eye, EyeOff, Save, X } from "lucide-react"
import Image from "next/image"

interface Deck {
  id: string
  title: string
  description: string | null
  images: string[]
  user_id: string
  is_public: boolean
  created_at: string
  cards_count: number
}

interface MyDecksModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MyDecksModal({ isOpen, onClose }: MyDecksModalProps) {
  const [myDecks, setMyDecks] = useState<Deck[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingDeck, setEditingDeck] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    title: string
    description: string
    is_public: boolean
  }>({ title: "", description: "", is_public: true })
  const [uploadingImages, setUploadingImages] = useState<string | null>(null)
  const [deletingDeck, setDeletingDeck] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen && user) {
      loadMyDecks()
    }
  }, [isOpen, user])

  const loadMyDecks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/decks/my-decks")
      if (response.ok) {
        const { decks } = await response.json()
        setMyDecks(decks || [])
      } else {
        console.error("Failed to fetch user decks")
        setMyDecks([])
      }
    } catch (error) {
      console.error("Error loading user decks:", error)
      setMyDecks([])
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (deck: Deck) => {
    setEditingDeck(deck.id)
    setEditForm({
      title: deck.title,
      description: deck.description || "",
      is_public: deck.is_public,
    })
  }

  const cancelEditing = () => {
    setEditingDeck(null)
    setEditForm({ title: "", description: "", is_public: true })
  }

  const handleSaveEdit = async (deckId: string) => {
    if (!editForm.title.trim()) {
      const event = new CustomEvent("showToast", {
        detail: { message: "Deck title cannot be empty" },
      })
      window.dispatchEvent(event)
      return
    }

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const { deck } = await response.json()
        setMyDecks((prev) => prev.map((d) => (d.id === deckId ? deck : d)))
        setEditingDeck(null)

        const event = new CustomEvent("showToast", {
          detail: { message: "Deck updated successfully!" },
        })
        window.dispatchEvent(event)
      } else {
        const { error } = await response.json()
        throw new Error(error || "Failed to update deck")
      }
    } catch (error) {
      console.error("Error updating deck:", error)
      const event = new CustomEvent("showToast", {
        detail: { message: error instanceof Error ? error.message : "Failed to update deck" },
      })
      window.dispatchEvent(event)
    }
  }

  const handleImageUpload = async (deckId: string, files: FileList | null) => {
    if (!files || files.length === 0) return

    const deck = myDecks.find((d) => d.id === deckId)
    if (!deck) return

    const requiredImages = deck.cards_count / 2

    if (files.length !== requiredImages) {
      const event = new CustomEvent("showToast", {
        detail: {
          message: `You must upload exactly ${requiredImages} images for ${deck.cards_count} cards`,
        },
      })
      window.dispatchEvent(event)
      return
    }

    setUploadingImages(deckId)

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("images", file)
      })

      const response = await fetch(`/api/decks/${deckId}/images`, {
        method: "PUT",
        body: formData,
      })

      if (response.ok) {
        const { deck: updatedDeck } = await response.json()
        setMyDecks((prev) => prev.map((d) => (d.id === deckId ? updatedDeck : d)))

        const event = new CustomEvent("showToast", {
          detail: { message: "Images updated successfully!" },
        })
        window.dispatchEvent(event)
      } else {
        const { error } = await response.json()
        throw new Error(error || "Failed to update images")
      }
    } catch (error) {
      console.error("Error updating images:", error)
      const event = new CustomEvent("showToast", {
        detail: { message: error instanceof Error ? error.message : "Failed to update images" },
      })
      window.dispatchEvent(event)
    } finally {
      setUploadingImages(null)
    }
  }

  const handleDeleteDeck = async (deckId: string) => {
    if (deletingDeck !== deckId) {
      setDeletingDeck(deckId)
      return
    }

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMyDecks((prev) => prev.filter((d) => d.id !== deckId))
        setDeletingDeck(null)

        const event = new CustomEvent("showToast", {
          detail: { message: "Deck deleted successfully!" },
        })
        window.dispatchEvent(event)
      } else {
        const { error } = await response.json()
        throw new Error(error || "Failed to delete deck")
      }
    } catch (error) {
      console.error("Error deleting deck:", error)
      const event = new CustomEvent("showToast", {
        detail: { message: error instanceof Error ? error.message : "Failed to delete deck" },
      })
      window.dispatchEvent(event)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Decks" size="large">
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-700/30 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : myDecks.length === 0 ? (
          <div className="text-center py-8">
            <Upload className="mx-auto h-12 w-12 text-gray-500" />
            <p className="text-gray-400 mt-2">No decks uploaded yet</p>
            <p className="text-sm text-gray-500 mt-1">Upload your first deck to get started!</p>
          </div>
        ) : (
          <div className="grid gap-5 max-h-[600px] overflow-y-auto pr-2">
            {myDecks.map((deck) => (
              <Card
                key={deck.id}
                className="bg-gray-800/50 border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200"
              >
                <CardContent className="p-5">
                  {editingDeck === deck.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`title-${deck.id}`} className="text-gray-300">
                          Deck Name
                        </Label>
                        <Input
                          id={`title-${deck.id}`}
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="bg-gray-800/50 border-gray-600/30 text-white"
                          placeholder="Enter deck name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`description-${deck.id}`} className="text-gray-300">
                          Description
                        </Label>
                        <Textarea
                          id={`description-${deck.id}`}
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="bg-gray-800/50 border-gray-600/30 text-white min-h-[80px]"
                          placeholder="Enter deck description (optional)"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor={`visibility-${deck.id}`} className="text-gray-300">
                          Public Visibility
                        </Label>
                        <Switch
                          id={`visibility-${deck.id}`}
                          checked={editForm.is_public}
                          onCheckedChange={(checked) => setEditForm({ ...editForm, is_public: checked })}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveEdit(deck.id)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          variant="outline"
                          className="flex-1 border-gray-600/30 text-gray-300 hover:bg-gray-700/50 bg-transparent"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex gap-4">
                      {/* Deck Preview */}
                      <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg p-2 flex-shrink-0">
                        <div className="grid grid-cols-2 gap-1 h-full">
                          {deck.images.slice(0, 4).map((image, index) => (
                            <div key={index} className="relative bg-white rounded-sm overflow-hidden">
                              <Image
                                src={image || "/placeholder.svg?height=40&width=40"}
                                alt={`${deck.title} card ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deck Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">{deck.title}</h3>
                            {deck.description && <p className="text-sm text-gray-400 mt-1">{deck.description}</p>}
                            <p className="text-xs text-gray-500 mt-1">{deck.cards_count} cards</p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                deck.is_public
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                              }`}
                            >
                              {deck.is_public ? (
                                <>
                                  <Eye className="mr-1 h-3 w-3" />
                                  Public
                                </>
                              ) : (
                                <>
                                  <EyeOff className="mr-1 h-3 w-3" />
                                  Private
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(deck)}
                            className="border-gray-600/30 text-gray-300 hover:bg-gray-700/50"
                          >
                            <Pencil className="mr-1 h-3 w-3" />
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => document.getElementById(`file-input-${deck.id}`)?.click()}
                            disabled={uploadingImages === deck.id}
                            className="border-gray-600/30 text-gray-300 hover:bg-gray-700/50"
                          >
                            <Upload className="mr-1 h-3 w-3" />
                            {uploadingImages === deck.id ? "Uploading..." : "Change Images"}
                          </Button>
                          <input
                            id={`file-input-${deck.id}`}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(deck.id, e.target.files)}
                          />

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteDeck(deck.id)}
                            className={`border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 ${
                              deletingDeck === deck.id ? "bg-red-500/20" : ""
                            }`}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            {deletingDeck === deck.id ? "Click again to confirm" : "Delete"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
