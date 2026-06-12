# OpenOtter

## What This Is

A mobile-first web app where you upload an audio file (from iPhone Voice Memos or similar), it gets transcribed with speaker diarization (who said what), and the result is stored for browsing and playback. The site is protected by Cloudflare Access for single-user personal use. Future versions will auto-create a formatted Notion page, generate an AI summary, and send an email notification when processing completes.

## Core Value

Get audio conversations into Notion as searchable, shareable transcripts with minimal friction.

## Current State (v1 — shipped 2026-06-11)

- App live at **otter.gsdlabs.dev**, protected by Cloudflare Access (manuelkuhs@gmail.com only)
- Upload MP3/WAV/M4A → AssemblyAI transcription with speaker diarization → stored in SQLite
- Recordings list with date, duration, speaker count; individual view with audio player + synchronized transcript
- Dark mode, shadcn/ui components, mobile-first layout, route-level loading skeletons
- ~2,400 lines TypeScript/TSX; PM2 process management on Hetzner VPS

## Requirements

### Validated

- ✓ **Mobile upload** — User can upload audio file from mobile device (iPhone Voice Memo compatible) — v1
- ✓ **Transcription** — Audio transcribed with speaker diarization (who said what) — v1
- ✓ **Mobile-first UI** — Web interface works in mobile Safari (iPhone) — v1
- ✓ **Authentication** — Site protected by Cloudflare Access (single user, email-based) — v1

### Active (v2)

- [ ] **Notion integration**: Auto-create formatted Notion page with transcript, summary, and metadata
- [ ] **Summarization**: AI-generated summary of the conversation
- [ ] **Email notifications**: User receives email on success (link + summary) and failure (error details)
- [ ] **Notion auth**: One-time OAuth flow to grant workspace access
- [ ] **Cost-effective**: Usage-based pricing preferred over high fixed monthly costs

### Out of Scope

- **Real-time transcription** — Batch processing only (upload → wait → result)
- **Video processing** — Audio-only files
- **Multi-user support** — Personal use, single-user authentication via Cloudflare
- **Advanced Notion features** — Simple page creation, not databases or cross-references
- **Mobile app** — Web-only (Safari on iOS is sufficient)
- **Recording capabilities** — Users already have Voice Memo apps

## Context

User relies heavily on AI chat workflows in daily life. Needs convenient way to get spoken conversations into text/Notion. Otter.ai is ideal but too expensive at £20/month. Willing to trade real-time features for cost savings. Conversations are typically 5 minutes to 1 hour. Primarily records conversations with other people (not just monologues).

**Tech stack (v1 actual):** Next.js 15 (App Router) · TypeScript · Tailwind + shadcn/ui · AssemblyAI SDK · SQLite (better-sqlite3) · Hetzner VPS (PM2) · Cloudflare Tunnel + Access

## Constraints

- **Hosting**: Hetzner VPS, local filesystem + SQLite (no Vercel, no cloud storage)
- **Budget**: Usage-based pricing preferred (avoid high fixed monthly costs)
- **Authentication**: Cloudflare Access for web app, one-time OAuth for Notion
- **Form factor**: Mobile-first (iPhone Safari)
- **Response time**: Flexible — user can close app after upload, check Notion later
- **Single-user**: Personal use only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Name: OpenOtter | Accepts trademark risk with Otter.ai similarity | ✓ Good — shipping as-is |
| Tech stack: AssemblyAI + Next.js + Hetzner | Proposed stack validated during Phase 1 | ✓ Good — all integrations work as expected |
| Local filesystem over Vercel Blob | Zero cost, direct file access, no CORS | ✓ Good — simpler than anticipated |
| SQLite over Vercel Postgres | Local storage, WAL mode, zero config | ✓ Good — fast and reliable on Hetzner |
| Cloudflare Access via API (automated) | No dashboard interaction needed | ✓ Good — fully automated provisioning |
| Direct DB call over loopback HTTP fetch | Cloudflare Access blocks server-side requests to protected domain | ✓ Good — fixed production bug, cleaner pattern |
| AI provider: Claude API | Superior summarization quality vs GPT-4o-mini | — Pending (v2) |
| Email via Resend | Shared account already available, generous free tier | — Pending (v2) |
| Notion OAuth | One-time authorization, no custom auth needed | — Pending (v2) |

---
*Last updated: 2026-06-11 after v1 milestone*
