"use client"
import { cn } from "@/lib/utils"

interface MemoryCardProps {
  id: string
  frontImage: string
  backImage?: string
  isFlipped: boolean
  isMatched: boolean
  onClick: () => void
  className?: string
}

export function MemoryCard({
  id,
  frontImage,
  backImage = "/card-back.jpg",
  isFlipped,
  isMatched,
  onClick,
  className,
}: MemoryCardProps) {
  return (
    <div
      className={cn(
        "relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 cursor-pointer transition-all duration-300",
        "hover:scale-105 hover:shadow-lg",
        isMatched && "opacity-75 cursor-default",
        className,
      )}
      onClick={!isMatched ? onClick : undefined}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-500 transform-style-preserve-3d",
          isFlipped && "rotate-y-180",
        )}
      >
        {/* Back of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="w-full h-full bg-card border-2 border-border rounded-2xl shadow-md flex items-center justify-center">
            <img
              src={backImage || "/placeholder.svg"}
              alt="Card back"
              className="w-16 h-16 object-cover rounded-lg opacity-60"
            />
          </div>
        </div>

        {/* Front of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <div
            className={cn(
              "w-full h-full bg-card border-2 rounded-2xl shadow-md overflow-hidden",
              isMatched ? "border-primary bg-primary/10" : "border-border",
            )}
          >
            <img src={frontImage || "/placeholder.svg"} alt="Memory card" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  )
}
