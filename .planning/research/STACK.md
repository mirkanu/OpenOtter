# Technology Stack

**Project:** OpenOtter
**Researched:** 2025-06-09
**Overall confidence:** HIGH

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Next.js** | 15.x (App Router) | Full-stack React framework with serverless deployment | Best-in-class serverless support on Vercel, App Router for modern API routes, built-in optimizations for mobile, edge runtime support |
| **React** | 19.x | UI library | Latest version with improved Server Components support, required by Next.js 15 |
| **TypeScript** | 5.x | Type safety | Critical for API integrations (AssemblyAI, Notion, Anthropic) — catches errors at compile time, not runtime |
| **Tailwind CSS** | 3.x+ | Styling | Mobile-first utility classes, integrates with shadcn/ui for rapid UI development |
| **shadcn/ui** | Latest | Component library | Copy-paste components (zero bundle overhead), responsive by default, excellent mobile patterns |

**Why Next.js on Vercel:** Zero-config serverless deployment, automatic HTTPS, edge runtime support for faster API responses, free tier generous enough for personal use, native Blob storage integration eliminates need for separate file storage service.

### Audio Transcription & AI

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **AssemblyAI SDK** | Latest via `assemblyai` npm package | Audio transcription + speaker diarization | **HIGH confidence** — Industry-leading accuracy, speaker diarization built-in (no post-processing), pay-as-you-go pricing ($0.37/hour for enhanced transcription), generous free tier, RESTful API with official Node.js SDK |
| **Anthropic Claude API** | Via `@anthropic-ai/sdk` npm package | AI summarization | **HIGH confidence** — Superior for summarization tasks vs. GPT-4, more cost-effective for long transcripts, streaming support reduces perceived latency |
| **(Alternative) OpenAI API** | Via `openai` npm package | Fallback summarization option | If Claude unavailable, GPT-4o-mini is cheaper but lower quality for nuanced summaries |

**Why AssemblyAI over alternatives:**
- **Speaker diarization built-in** — Deepgram/Rev require separate models or post-processing
- **Higher accuracy** — Especially for multi-speaker conversations (project's primary use case)
- **Simple pricing** — $0.37/hour with no hidden fees, vs. complex tiered pricing from competitors
- **No infrastructure** — Fully hosted API, no GPU/server management needed
- **Official SDK** — Well-maintained Node.js package with TypeScript support

**Why not self-hosted Whisper:** User explicitly wants serverless/pay-per-use, no GPU costs, no server management. Whisper requires GPU inference for reasonable speed (~10min audio = ~2-3min on M1 Pro, ~10min on CPU) or paid GPU hosting, defeating the purpose.

### Notion Integration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Notion SDK** | Via `@notionhq/client` npm package | Notion API integration (page creation, blocks) | **HIGH confidence** — Official Notion-maintained SDK, TypeScript support, OAuth flow documented, community-tested |
| **Notion OAuth** | Notion's built-in OAuth 2.0 flow | One-time workspace authorization | Standard OAuth 2.0 implementation, Notion's official docs guide the flow, no custom auth needed |

**Why not react-notion-x:** That's for rendering Notion pages as React components (reading), not creating pages via API (writing). We need the official Notion API for write operations.

### Email Service

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Resend** | Latest via `resend` npm package | Transactional email notifications | **HIGH confidence** — Modern DX, 3,000 free emails/month (sufficient for personal use), reliable deliverability, simple API, shared Resend account already available at `/home/services/.env.production` |
| **React Email** | Via `react-email` npm package | Email templates (optional) | For prettier HTML emails if needed later, Resend integrates natively |

**Why Resend over SendGrid/Mailgun:** 
- **Free tier more generous** — 3,000 emails/month vs. 100 (SendGrid) or pay-only (Mailgun)
- **Better DX** — Modern API, excellent TypeScript SDK
- **Simpler pricing** — No complex tiered plans, just $20/mo for 50K emails if needed
- **Already available** — Shared infrastructure means no new account setup

### File Storage & Upload

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vercel Blob** | Via `@vercel/blob` npm package | Audio file storage (before transcription) | **HIGH confidence** — Native Vercel integration, 5TB max upload via client-side (bypasses 4.5MB server limit), pay-as-you-go ($0.15/GB storage + $0.02/GB bandwidth), globally cached URLs |
| **FormData API** | Native browser API | Client-side file upload | Standard browser API, no extra library needed for simple file uploads |

**Why Vercel Blob over AWS S3:**
- **Zero config** — Works out of the box with Vercel projects, no bucket setup or CORS configuration
- **Client-side upload** — Direct upload from browser to Blob (bypasses Vercel's 4.5MB serverless limit), supports up to 5TB files
- **Cheaper for personal use** — No minimum fees, pay only for what you use
- **Better UX** — Upload progress tracking built-in, globally cached URLs for faster access

**Why not Cloudflare R2:** User already has Vercel deployment, adding R2 introduces extra complexity. Vercel Blob is tightly integrated with Vercel's edge network and requires zero configuration.

### Database (Optional)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vercel Postgres** | Via `@vercel/postgres` npm package | Store job status, transcription history | If needed for tracking job progress beyond Notion. Serverless Postgres with connection pooling, free tier up to 512MB, scales automatically |

**Note:** May not need a database at all. Notion pages can store job metadata directly. Only add if we need job queue tracking beyond what Notion can handle (e.g., for retry logic, audit logs).

### Infrastructure & Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vercel** | Latest (serverless platform) | Deployment, hosting, edge functions | **HIGH confidence** — Best-in-class Next.js support, zero config, free tier for personal use, edge runtime for faster API responses, automatic HTTPS |
| **Cloudflare Access** | Via Cloudflare Zero Trust | Single-user authentication (web app) | Already available on user's Cloudflare account, no custom auth code needed, email-based login, protects at edge before traffic reaches Vercel |
| **GitHub** | Via `gh` CLI | Repository management | Private repo by default, stores code and version history |

**Why not Netlify/AWS Amplify:** Vercel is the canonical choice for Next.js deployments. Deep integration with Next.js internals, better App Router support, native Blob storage, edge runtime optimization. Netlify is fine but Vercel is purpose-built for Next.js.

**Why not self-hosted:** User explicitly wants serverless, pay-per-use, no server management. Self-hosting requires monitoring, updates, security patching, backup — all overhead for a personal tool.

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | Latest | Schema validation for API responses | Validate AssemblyAI transcription format, Notion API responses, email payloads |
| `date-fns` | Latest | Date formatting | Format recording dates, durations for Notion page metadata |
| `nanoid` | Latest | Generate job IDs | If we need to track transcription jobs (e.g., `/api/transcribe/[jobId]`) |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| **Transcription** | AssemblyAI | Deepgram | Speaker diarization is an add-on feature, not first-class. Pricing is competitive but AssemblyAI's free tier is more generous. Deepgram's diarization accuracy is lower for multi-speaker conversations. |
| **Transcription** | AssemblyAI | Rev AI | Rev's API pricing is complex (per-minute + diarization fees), minimum monthly spends for higher tiers. AssemblyAI's simple pay-as-you-go is better for personal use. |
| **Transcription** | AssemblyAI | OpenAI Whisper API | Whisper API is cheaper ($0.006/minute) but requires separate speaker diarization implementation (not built-in). Self-hosted Whisper violates user's "no GPU/server management" constraint. |
| **AI Summarization** | Claude API | OpenAI GPT-4o-mini | GPT-4o-mini is cheaper but produces lower-quality summaries for nuanced conversations. User validated preference for Claude output quality. |
| **Email** | Resend | SendGrid | SendGrid's free tier is only 100 emails/day, insufficient for burst usage. Resend gives 3,000 emails/month with better DX. |
| **Email** | Resend | Mailgun | Mailgun has no free tier (pay-only trial), more expensive for low volumes. Resend is simpler and cheaper for personal use. |
| **File Storage** | Vercel Blob | AWS S3 | S3 requires bucket creation, CORS configuration, IAM setup. Vercel Blob is zero-config and works out of the box with Vercel projects. |
| **File Storage** | Vercel Blob | Cloudflare R2 | R2 is excellent (zero egress fees) but requires additional setup. User already deploying to Vercel, so Blob is the path of least resistance. |
| **Hosting** | Vercel | Netlify | Netlify is capable but Vercel has deeper Next.js integration, better App Router support, native Blob storage, and edge runtime optimizations. |
| **Authentication** | Cloudflare Access | Custom NextAuth.js | Building custom auth for a single user is overkill. Cloudflare Access is free, already available on user's account, and protects at the edge. |

## Installation

```bash
# Core framework
npx create-next-app@latest openotter --typescript --tailwind --app
cd openotter

# Dependencies
npm install assemblyai @anthropic-ai/sdk @notionhq/client resend
npm install @vercel/blob zod date-fns nanoid

# Dev dependencies
npm install -D @types/node

# shadcn/ui setup
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select textarea skeleton
```

## Environment Variables

```bash
# Transcription & AI
ASSEMBLYAI_API_KEY=           # From AssemblyAI dashboard
ANTHROPIC_API_KEY=            # From Anthropic dashboard

# Notion (from OAuth flow)
NOTION_CLIENT_ID=             # Notion OAuth app client ID
NOTION_CLIENT_SECRET=         # Notion OAuth app client secret
NOTION_REDIRECT_URI=          # e.g., https://openotter.gsdlabs.dev/api/auth/callback

# Email (from shared /home/services/.env.production)
OPNOTTER_RESEND_API_KEY=      # Project-scoped Resend API key

# Vercel (auto-populated)
BLOB_READ_WRITE_TOKEN=        # Vercel auto-injects this
```

## Architecture Diagram

```
┌─────────────────┐
│ Mobile Safari   │
│ (iPhone)        │
└────────┬────────┘
         │ Upload audio file
         ▼
┌─────────────────────────────────────────┐
│ Cloudflare Access (Authentication)       │
│ Email-based login, edge-protected        │
└────────┬────────────────────────────────┘
         │ Authorized
         ▼
┌─────────────────────────────────────────┐
│ Vercel (Next.js App Router)             │
│ /api/upload ────────► Vercel Blob        │
│ /api/transcribe ───► AssemblyAI         │
│ /api/summarize ────► Claude API          │
│ /api/notion ────────► Notion API        │
│ /api/notify ────────► Resend            │
└─────────────────────────────────────────┘
```

## Sources

- **AssemblyAI:** Official documentation (pricing, API reference) — HIGH confidence
- **Anthropic Claude:** Official API documentation — HIGH confidence  
- **Resend:** Official pricing and API documentation — HIGH confidence
- **Vercel Blob:** Official documentation (file upload, pricing) — HIGH confidence
- **Notion API:** Official developer documentation — HIGH confidence
- **Next.js:** Official App Router and Route Handlers documentation — HIGH confidence
- **Cloudflare Access:** Official Zero Trust documentation — HIGH confidence

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|-------|
| Core Framework (Next.js/Vercel) | HIGH | Official documentation, industry-standard for serverless React |
| Transcription (AssemblyAI) | HIGH | Official docs verified, pricing confirmed, speaker diarization features documented |
| AI Summarization (Claude) | HIGH | Official Anthropic documentation, API capabilities verified |
| Notion Integration | HIGH | Official Notion SDK documentation, OAuth flow documented |
| Email (Resend) | HIGH | Official Resend pricing and API documentation |
| File Storage (Vercel Blob) | HIGH | Official Vercel documentation, client-side upload capabilities confirmed |
| Authentication (Cloudflare Access) | HIGH | Official Cloudflare Zero Trust documentation |

**Overall confidence:** HIGH — All recommendations are based on official documentation and verified capabilities. No training-data-only assertions. Stack is modern, well-maintained, and aligned with user's serverless/pay-per-use requirements.
