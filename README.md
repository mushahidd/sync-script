# SyncScript

**Collaborative research management with AI-powered citations and real-time sync.**

SyncScript is a modern SaaS application for researchers and teams to manage sources, upload PDFs, generate AI-powered APA citations, and collaborate in real time across shared vaults.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://www.prisma.io/)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Collaborative Vaults** | Create vaults, invite collaborators, manage roles (Owner/Contributor) |
| **PDF Upload & Parsing** | Upload PDFs to Cloudinary, extract text and metadata |
| **AI Citation Generation** | OpenRouter-powered APA citations from PDF content |
| **Real-time Sync** | Pusher-powered live updates when sources are added |
| **Annotations** | Add and manage annotations on sources |
| **Auth** | NextAuth with credentials and optional Google OAuth |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/mushahidd/sync-script.git
cd sync-script
npm install
```

### 2. Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret for NextAuth (e.g. `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |

Optional (for full features):

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | For AI citation generation |
| `CLOUDINARY_*` | For PDF storage |
| `PUSHER_*` | For real-time sync |
| `GOOGLE_CLIENT_ID/SECRET` | For Google OAuth |

### 3. Database Setup

```bash
npm run db:generate
npm run db:push
# Optional: seed with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
syncscript/
├── app/
│   ├── api/              # API routes (auth, vaults, sources, citations, PDFs)
│   ├── dashboard/        # Dashboard page
│   ├── vaults/[id]/      # Vault detail with sources, PDFs, collaborators
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── page.tsx          # Landing page
├── components/
│   ├── dashboard/        # Sidebar, layout
│   ├── ui/               # Button, Card, Modal, Tabs, Input, etc.
│   └── providers.tsx     # Auth & UI providers
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Prisma client
│   ├── citation-generator.ts  # AI citation (OpenRouter)
│   ├── pdf-parser.ts     # PDF text extraction
│   ├── cloudinary.ts     # Cloudinary upload
│   └── pusher-server.ts  # Real-time events
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── scripts/              # DB setup, PDF migration, utilities
└── docs/                 # Setup guides
```

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:setup` | Setup database (generate + push) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database |
| `npm run pdf:verify` | Verify PDF configuration |
| `npm run pdf:migrate` | Migrate PDFs to Cloudinary |

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Storage:** Cloudinary (PDFs)
- **Real-time:** Pusher
- **AI:** OpenRouter (citation generation)

---

## 📖 Documentation

- [Setup Guide](docs/SETUP.md) – Database, Cloudinary, Pusher configuration

---

## 📄 License

This project is available for educational and hackathon purposes.

---

## 🔗 Links

- **Repository:** [github.com/mushahidd/sync-script](https://github.com/mushahidd/sync-script)
