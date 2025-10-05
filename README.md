🧠 PexesoApp — The AI Memory Game

PexesoApp is a modern, aesthetic, and intelligent web-based memory game where users can train their focus and memory using AI-generated or custom decks.
Built with Next.js 14, Supabase, and Tailwind CSS, it brings a new twist to the classic Pexeso (Concentration) game — allowing users to play solo, against a smart bot, or locally with a friend on the same screen.

🌐 Live App: https://pexeso.app

⸻

✨ Features

🎮 Game Modes
	•	Solo mode – Play and beat your own best times and move counts.
	•	1v1 local mode – Challenge a friend on the same device, taking turns to find pairs.
	•	Bot mode – Play against an intelligent AI opponent that remembers card positions.

🎨 AI & Custom Decks
	•	Generate themed decks using AI image generation.
	•	Upload your own pictures to create a custom Pexeso deck.
	•	Choose how many pairs you want to play with (16, 24, or 32 cards).

🧩 Smooth Gameplay
	•	Modern grid-based board with animations and responsive layout.
	•	Multiple deck sizes and difficulty levels.
	•	Dynamic turn tracking and score updates.

🌍 Multilingual Interface
	•	Fully localized using Next-Intl (English, Slovak, Czech, Spanish, German, Portuguese, Italian, etc.).
	•	Automatic locale detection and dynamic route-based translations.

💾 User Accounts & Personalization
	•	Sign up or log in via Supabase Auth.
	•	Save your favorite decks and replay them anytime.
	•	Upgrade to premium for additional AI generations and deck storage.

🧠 Clean UI & UX
	•	Built with Tailwind CSS and responsive layout.
	•	Unified theme across the app — from deck gallery to settings modals.
	•	Consistent experience across mobile and desktop.

⸻

🏗️ Tech Stack

Frontend: Next.js 14 (App Router), TypeScript, React
Styling: Tailwind CSS, Framer Motion
Backend / DB: Supabase (PostgreSQL, Storage, Auth)
AI Generation: OpenAI / FAL-AI API for deck image generation
Deployment: Vercel
Localization (i18n): next-intl
Email / Auth: Supabase Email Auth, Resend (transactional emails)

⸻

📸 Screenshots

Deck Gallery — Game Board — Upload Deck
(Add your screenshots under /public/screenshots/ to show them on GitHub.)

⸻

⚙️ Setup & Development
	1.	Clone the repository
	•	git clone https://github.com/yourusername/pexesoapp.git
	•	cd pexesoapp
	2.	Install dependencies
	•	pnpm install or npm install
	3.	Create your environment variables
	•	Add a .env.local file with:
	•	NEXT_PUBLIC_SUPABASE_URL
	•	NEXT_PUBLIC_SUPABASE_ANON_KEY
	•	SUPABASE_SERVICE_ROLE_KEY
	•	OPENAI_API_KEY
	•	NEXT_PUBLIC_SITE_URL=https://pexeso.app
	4.	Run locally
	•	pnpm dev or npm run dev
	5.	Open in browser
	•	http://localhost:3000

⸻

🗂️ Folder Structure

pexesoapp/
├── app/ — Next.js App Router pages
│   ├── [locale]/ — Localized routes
│   ├── api/ — API routes (deck upload, AI generation, etc.)
│   └── layout.tsx — Root layout
├── components/ — Reusable UI components (modals, buttons, etc.)
├── lib/ — Supabase client, i18n config, helpers
├── public/ — Static assets & screenshots
├── styles/ — Global styles
└── locales/ — Translation JSON files

⸻

🧱 Core Functionality Overview

Deck Generation — Users can describe a theme (e.g., “Cute birds”) → AI generates matching pairs of safe-for-work images.
Deck Upload — Users can upload 8 / 12 / 16 unique images for 16 / 24 / 32 cards respectively.
Favorites System — Logged-in users can favorite decks and easily replay them.
Deck Gallery — Displays all public decks with sorting by popularity, favorites, or newest.
Game Logic — Classic Pexeso mechanics: match pairs, track turns, and complete the grid.
Play Modes — Choose solo, play with a friend, or test your memory against a smart bot.
Localization — Every label, modal, and button is translated using JSON locale files.

⸻

🚀 Deployment

The app is fully configured for Vercel deployment.
	1.	Push your repo to GitHub.
	2.	Connect your project to Vercel.
	3.	Add the same .env variables in your Vercel dashboard.
	4.	Deploy — automatic build with Next.js 14 and Supabase integration.

⸻

💡 Roadmap
	•	Add sound effects and animations for card flips.
	•	Add user statistics and leaderboards.
	•	Add dark/light theme toggle.
	•	Improve AI deck generation quality and variation.
	•	Add shareable deck links and social features.

⸻

🧑‍💻 Contributing

Contributions, feedback, and ideas are welcome!
	1.	Fork the repository.
	2.	Create your feature branch (git checkout -b feature/amazing-feature).
	3.	Commit your changes (git commit -m 'Add amazing feature').
	4.	Push to the branch (git push origin feature/amazing-feature).
	5.	Open a Pull Request.

⸻

📜 License

This project is licensed under the MIT License — see the LICENSE file for details.

⸻

💬 Credits

Developed by Nikolas Pastier
Built with ❤️ using Next.js, Supabase, and OpenAI.

⸻

🌟 If you like this project

Give it a ⭐ on GitHub and share it with friends!
