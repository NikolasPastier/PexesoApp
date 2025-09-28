"use client"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useI18n } from "@/contexts/i18n-context"
import { locales, localeNames, localeFlags, type Locale } from "@/lib/i18n/config"
import { useTranslations } from "next-intl"

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  const t = useTranslations("language")

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-white hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-600/30 rounded-lg px-3 py-2 h-10 max-sm:px-2 max-sm:text-sm transition-all duration-200"
          title={t("switchLanguage")}
        >
          <span className="text-base">{localeFlags[locale]}</span>
          <span className="hidden sm:inline text-sm font-medium">{localeNames[locale]}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm border border-gray-700/30 text-white"
      >
        {locales.map((lang) => (
          <DropdownMenuItem
            key={lang}
            className="cursor-pointer hover:bg-gray-700/50 focus:bg-gray-700/50 flex items-center gap-3"
            onClick={() => handleLanguageChange(lang)}
          >
            <span className="text-base">{localeFlags[lang]}</span>
            <span className="text-sm font-medium capitalize">{localeNames[lang]}</span>
            {locale === lang && <span className="ml-auto text-xs text-gray-400">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
