# SyncScript Setup Guide

Complete setup instructions for database, Cloudinary, Pusher, and AI citations.

---

## Database (PostgreSQL + Prisma)

### 1. Configure Connection

Add to `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

**Examples:**
- Local: `postgresql://postgres:password@localhost:5432/syncscript`
- Docker: `docker run --name syncscript-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15`
- Neon/Supabase: Use connection string from your provider

### 2. Initialize Database

```bash
npm run db:generate
npm run db:push
npm run db:seed   # Optional: demo users & vaults
```

---

## Cloudinary (PDF Storage)

### 1. Create Cloudinary Account

Sign up at [cloudinary.com](https://cloudinary.com).

### 2. Add to `.env`

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Behavior

- PDFs are uploaded with `resource_type: 'raw'`
- Stored in `syncscript_pdfs` folder
- Direct CDN URLs for viewing/downloading

---

## Pusher (Real-time Sync)

### 1. Create Pusher App

Sign up at [pusher.com](https://pusher.com) and create an app.

### 2. Add to `.env`

```env
PUSHER_APP_ID="your-app-id"
PUSHER_KEY="your-key"
PUSHER_SECRET="your-secret"
PUSHER_CLUSTER="us2"

NEXT_PUBLIC_PUSHER_KEY="your-key"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"
```

### 3. Behavior

- Real-time updates when sources/citations are added
- Channel: `vault-{vaultId}`

---

## AI Citations (OpenRouter)

### 1. Get API Key

Sign up at [openrouter.ai](https://openrouter.ai) and create an API key.

### 2. Add to `.env`

```env
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_MODEL="mistralai/mistral-7b-instruct"   # Optional, default model
```

### 3. Behavior

- Generates APA citations from PDF metadata or extracted text
- Falls back to basic format if AI fails
- Uses OpenRouter for model flexibility

---

## Google OAuth (Optional)

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

Configure OAuth consent screen and credentials in Google Cloud Console.
