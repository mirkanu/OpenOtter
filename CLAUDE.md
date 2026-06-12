<!-- GSD:project-start source:PROJECT.md -->
## Project

**OpenOtter**

A mobile-first web app where you upload an audio file (from iPhone Voice Memos or similar), it gets transcribed with speaker diarization (who said what) and summarized, then automatically creates a formatted page in your Notion workspace. You get an email notification when it's done (with a link to the page and the summary) or if it fails. The site is protected by Cloudflare Access for single-user personal use.

**Core Value:** Get audio conversations into Notion as searchable, shareable transcripts with minimal friction.

### Constraints

- **Tech stack**: Hetzner VPS deployment with local storage (SQLite + filesystem)
- **Budget**: Fixed-cost Hetzner server (~€4-6/mo) with usage-based APIs (AssemblyAI, Claude, Notion)
- **Authentication**: Cloudflare Access for web app, one-time OAuth for Notion
- **Form factor**: Mobile-first (iPhone Safari)
- **Response time**: Flexible — user can close app after upload, check Notion later
- **Single-user**: Personal use only
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Next.js** | 15.x (App Router) | Full-stack React framework for Hetzner VPS deployment | App Router for modern API routes, built-in optimizations for mobile, works with PM2/Docker deployment on Hetzner |
| **React** | 19.x | UI library | Latest version with improved Server Components support, required by Next.js 15 |
| **TypeScript** | 5.x | Type safety | Critical for API integrations (AssemblyAI, Notion, Anthropic) — catches errors at compile time, not runtime |
| **Tailwind CSS** | 3.x+ | Styling | Mobile-first utility classes, integrates with shadcn/ui for rapid UI development |
| **shadcn/ui** | Latest | Component library | Copy-paste components (zero bundle overhead), responsive by default, excellent mobile patterns |
### Audio Transcription & AI
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **AssemblyAI SDK** | Latest via `assemblyai` npm package | Audio transcription + speaker diarization | **HIGH confidence** — Industry-leading accuracy, speaker diarization built-in (no post-processing), pay-as-you-go pricing ($0.37/hour for enhanced transcription), generous free tier, RESTful API with official Node.js SDK |
| **Anthropic Claude API** | Via `@anthropic-ai/sdk` npm package | AI summarization | **HIGH confidence** — Superior for summarization tasks vs. GPT-4, more cost-effective for long transcripts, streaming support reduces perceived latency |
| **(Alternative) OpenAI API** | Via `openai` npm package | Fallback summarization option | If Claude unavailable, GPT-4o-mini is cheaper but lower quality for nuanced summaries |
- **Speaker diarization built-in** — Deepgram/Rev require separate models or post-processing
- **Higher accuracy** — Especially for multi-speaker conversations (project's primary use case)
- **Simple pricing** — $0.37/hour with no hidden fees, vs. complex tiered pricing from competitors
- **No infrastructure** — Fully hosted API, no GPU/server management needed
- **Official SDK** — Well-maintained Node.js package with TypeScript support
### Notion Integration
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Notion SDK** | Via `@notionhq/client` npm package | Notion API integration (page creation, blocks) | **HIGH confidence** — Official Notion-maintained SDK, TypeScript support, OAuth flow documented, community-tested |
| **Notion OAuth** | Notion's built-in OAuth 2.0 flow | One-time workspace authorization | Standard OAuth 2.0 implementation, Notion's official docs guide the flow, no custom auth needed |
### Email Service
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Resend** | Latest via `resend` npm package | Transactional email notifications | **HIGH confidence** — Modern DX, 3,000 free emails/month (sufficient for personal use), reliable deliverability, simple API, shared Resend account already available at `/home/services/.env.production` |
| **React Email** | Via `react-email` npm package | Email templates (optional) | For prettier HTML emails if needed later, Resend integrates natively |
- **Free tier more generous** — 3,000 emails/month vs. 100 (SendGrid) or pay-only (Mailgun)
- **Better DX** — Modern API, excellent TypeScript SDK
- **Simpler pricing** — No complex tiered plans, just $20/mo for 50K emails if needed
- **Already available** — Shared infrastructure means no new account setup
### File Storage & Upload
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Local filesystem** | Node.js `fs/promises` | Audio file storage (before transcription) | **HIGH confidence** — Zero cost, already implemented in Phase 1 at `/home/services/openotter/uploads`, works with Hetzner deployment |
| **FormData API** | Native browser API | Client-side file upload | Standard browser API, no extra library needed for simple file uploads |
- **Zero cost** — Local filesystem storage on Hetzner VPS, no external service fees
- **Direct file access** — AssemblyAI can access local files via filepath for transcription
- **Simple backup** — Standard filesystem backup tools, no API rate limits
### Database (Optional)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **SQLite** | Via `better-sqlite3` v12.10.0 npm package | Store job status, transcription history, recording metadata | **HIGH confidence** — Serverless SQLite with zero config, perfect for single-user Hetzner deployment, WAL mode for concurrency, prepared statements for SQL injection protection |
### Infrastructure & Deployment
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Hetzner VPS** | Latest (dedicated server) | Deployment, hosting, file storage | **HIGH confidence** — Fixed cost (~€4-6/mo), full control over environment, local filesystem for audio files, PM2/Docker for process management |
| **Cloudflare Tunnel** | Via cloudflared | Secure tunnel to Hetzner VPS | **HIGH confidence** — Zero-trust connectivity, no open ports needed, protects Hetzner VPS behind Cloudflare network |
| **Cloudflare Access** | Via Cloudflare Zero Trust | Single-user authentication (web app) | Already available on user's Cloudflare account, no custom auth code needed, email-based login, protects at edge before traffic reaches Hetzner |
| **GitHub** | Via `gh` CLI | Repository management | Private repo by default, stores code and version history |
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
| **File Storage** | Local filesystem | AWS S3 | S3 requires bucket creation, CORS configuration, IAM setup, and ongoing costs. Local filesystem is zero-cost and simpler for single-user Hetzner deployment. |
| **File Storage** | Local filesystem | Cloudflare R2 | R2 is excellent (zero egress fees) but requires additional setup and API integration. Local filesystem is already implemented in Phase 1. |
| **Hosting** | Hetzner VPS | Netlify | Netlify is capable but requires serverless architecture. Hetzner VPS provides fixed-cost server with full control over environment. |
| **Authentication** | Cloudflare Access | Custom NextAuth.js | Building custom auth for a single user is overkill. Cloudflare Access is free, already available on user's account, and protects at the edge. |
## Installation
# Core framework
# Dependencies
# Dev dependencies
# shadcn/ui setup
## Environment Variables
# Transcription & AI
# Notion (from OAuth flow)
# Email (from shared /home/services/.env.production)
# Hetzner (UPLOAD_DIR, DATABASE_PATH)
## Architecture Diagram
## Sources
- **AssemblyAI:** Official documentation (pricing, API reference) — HIGH confidence
- **Anthropic Claude:** Official API documentation — HIGH confidence  
- **Resend:** Official pricing and API documentation — HIGH confidence
- **Local filesystem (Node.js fs/promises):** Official Node.js documentation — HIGH confidence
- **SQLite (better-sqlite3):** Official better-sqlite3 documentation — HIGH confidence
- **Notion API:** Official developer documentation — HIGH confidence
- **Next.js:** Official App Router and Route Handlers documentation — HIGH confidence
- **Hetzner VPS:** Official Hetzner documentation — HIGH confidence
- **Cloudflare Access:** Official Zero Trust documentation — HIGH confidence
## Confidence Assessment
| Area | Confidence | Reason |
|------|------------|-------|
| Core Framework (Next.js/Hetzner) | HIGH | Official documentation, standard deployment on Hetzner VPS with PM2/Docker |
| Transcription (AssemblyAI) | HIGH | Official docs verified, pricing confirmed, speaker diarization features documented |
| AI Summarization (Claude) | HIGH | Official Anthropic documentation, API capabilities verified |
| Notion Integration | HIGH | Official Notion SDK documentation, OAuth flow documented |
| Email (Resend) | HIGH | Official Resend pricing and API documentation |
| File Storage (Local filesystem) | HIGH | Node.js fs/promises documented, implemented in Phase 1 at `/home/services/openotter/uploads` |
| Database (SQLite/better-sqlite3) | HIGH | Official better-sqlite3 documentation, v12.10.0 verified, WAL mode for concurrency |
| Authentication (Cloudflare Access) | HIGH | Official Cloudflare Zero Trust documentation |
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
