# Milestone v1: MVP

**Status:** ✅ SHIPPED 2026-06-11
**Phases:** 1, 1.5, 1.6, 1.7
**Total Plans:** 11

## Overview

Working transcription app with Cloudflare Access protection, deployed on Hetzner VPS. User can upload audio from mobile, receive a transcribed and speaker-diarized transcript, browse all recordings, and play back audio with synchronized transcript. The entire app is protected by Cloudflare Access and served via Cloudflare Tunnel at otter.gsdlabs.dev.

## Phases

### Phase 1: Audio Processing Core

**Goal:** User can upload audio and receive transcribed text with speaker identification
**Depends on:** Nothing
**Requirements:** AUDIO-01, TRAN-01
**Plans:** 3 plans

Plans:

- [x] 01-01: Project Foundation and Client Libraries
- [x] 01-02: API Routes for Upload and Transcription
- [x] 01-03: Frontend UI Components

**Details:**

- Next.js 15 App Router project bootstrapped with TypeScript, Tailwind, ESLint
- AssemblyAI SDK integrated for speaker diarization transcription
- Local filesystem storage at `/home/services/openotter/uploads/`
- Upload endpoint, transcription endpoint, polling endpoint
- Mobile-first AudioUploader component with progress tracking
- TranscriptDisplay component rendering speaker-labeled segments
- Quick task: replaced Vercel Blob with local Hetzner filesystem storage

### Phase 1.5: Recording Management

**Goal:** User can browse all recordings and play audio with synchronized transcript
**Depends on:** Phase 1
**Requirements:** AUDIO-01, TRAN-01
**Plans:** 3 plans

Plans:

- [x] 01.5-01: Database Persistence Layer (SQLite)
- [x] 01.5-02: Recording API Routes and Transcription Integration
- [x] 01.5-03: Recording Management UI

**Details:**

- SQLite database (better-sqlite3) with WAL mode at `/home/services/openotter/openotter.db`
- RecordingMetadata types, synchronous recording store (CRUD + query operations)
- `/api/recordings` list/save, `/api/recordings/[id]` detail/delete, `/api/audio/[id]` proxy
- Transcribe route updated to save results to SQLite on completion
- RecordingCard, RecordingList, AudioPlayer, SyncedTranscript components
- Recordings list page and individual recording detail page
- Bugs fixed post-UAT: missing `filename` in transcribe request, `ASSEMBLYAI_API_KEY` env propagation, transcript page not calling `saveRecording()`, `formatDuration` seconds/ms mismatch

### Phase 1.6: MVP Mobile UI

**Goal:** MVP screens work smoothly on iPhone Safari
**Depends on:** Phase 1.5
**Requirements:** UI-01
**Plans:** 4 plans

Plans:

- [x] 01.6-01: Design System + Data Layer Foundation
- [x] 01.6-02: Component Rewrites and New Components
- [x] 01.6-03: API Route and AudioUploader Updates
- [x] 01.6-04: Pages, Layout, and Loading Skeletons

**Details:**

- shadcn/ui installed with Tailwind animate plugin
- Three date columns added to SQLite: `file_created_at`, `recorded_at`, `transcribed_at`
- ThemeProvider (dark mode via next-themes), StickyHeader with theme toggle
- RecordingCard/RecordingList rewritten with shadcn Card, EmptyState, RecordingCardSkeleton
- ExportButton (TXT export), SyncedTranscript restyled
- AudioUploader sends `fileLastModified`; upload route extracts `file_created_at`; transcribe route sets `transcribed_at`
- Root layout wired with ThemeProvider + StickyHeader; `/` redirects to recordings list; detail page rewritten with metadata block
- Loading skeletons added at root and detail routes
- Postcss config fix for Tailwind processing

### Phase 1.7: Hetzner Deployment

**Goal:** App is live on the Hetzner VPS with Cloudflare Access protection
**Depends on:** Phase 1.6
**Requirements:** UI-01
**Plans:** 1 plan

Plans:

- [x] 01.7-01: Cloudflare Access Protection + End-to-End Verification

**Details:**

- Cloudflare Access self-hosted application (`OpenOtter`) configured via Cloudflare API (automated, no dashboard needed)
- Allow policy restricted to `manuelkuhs@gmail.com`
- End-to-end flow verified: upload → AssemblyAI transcription → SQLite save → recordings list → audio playback
- Bug fixed: replaced loopback HTTP fetch in `page.tsx` with direct `getAllRecordings()` DB call (Cloudflare Access was blocking server-side requests to the protected domain)
- PM2 process management and Cloudflare Tunnel were already complete prior to this phase

---

## Milestone Summary

**Decimal Phases:**

- Phase 1.5: Recording Management (inserted after Phase 1 — database and browsing needed for MVP before UI polish)
- Phase 1.6: MVP Mobile UI (inserted before deployment to polish mobile experience)
- Phase 1.7: Hetzner Deployment (inserted to handle deployment as a distinct phase)

**Key Decisions:**

- Use SQLite (better-sqlite3) over Vercel Postgres — local storage, zero cost, WAL mode for concurrency
- Use local Hetzner filesystem over Vercel Blob — zero cost, direct file access, no CORS complexity
- Cloudflare Access via API (automated) — no dashboard interaction needed
- Replace loopback HTTP fetch with direct DB call — Cloudflare Access blocks server-side authenticated requests

**Issues Resolved:**

- Vercel-specific dependencies (Blob, Postgres) replaced with local equivalents before deployment
- AssemblyAI API key not propagating from PM2 `env_file` — added explicitly to `ecosystem.config.js` env block
- Postcss config missing, breaking Tailwind CSS processing in production
- `formatDuration` treating seconds as milliseconds (showing 0:00 for all recordings)

**Issues Deferred:**

- Phase 02 (Notion Integration) plan was drafted during Milestone 1 but not executed — ready for Milestone 2

**Technical Debt Incurred:**

- None significant — clean foundation for Milestone 2

---

_For current project status, see .planning/ROADMAP.md_
