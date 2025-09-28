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
  backImage = "/card-back-logo.jpeg",
  isFlipped,
  isMatched,
  onClick,
  className,
}: MemoryCardProps) {
  return (
    <div
      className={cn(
        "relative w-20 h-20 max-sm:w-16 max-sm:h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 cursor-pointer transition-all duration-300",
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
          <div className="w-full h-full bg-card border-2 border-border rounded-2xl shadow-md overflow-hidden">
            <img src={backImage || "/placeholder.svg"} alt="Card back" className="w-full h-full object-cover" />
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
