"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  const t = useTranslations("common")

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="javascript:history.back()">{t("back")}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
