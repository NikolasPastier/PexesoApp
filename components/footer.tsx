export function Footer() {
  return (
    <footer className="mt-16 py-2.5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-black my-0">
          <span className="text-black">© 2025 Pexeso.app All rights reserved</span>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-muted-foreground/50">|</span>
            <a href="/privacy-policy" className="transition-colors duration-200 hover:text-foreground">
              Privacy Policy
            </a>
            <span className="text-muted-foreground/50">|</span>
            <a href="/terms-of-use" className="transition-colors duration-200 hover:text-foreground">
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
