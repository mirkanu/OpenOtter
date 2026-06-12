---
gsd_state_version: 1.0
milestone: v2
milestone_name: integrations
current_phase: 02
status: planning_next_milestone
last_updated: "2026-06-11T22:30:00.000Z"
progress:
  total_phases: 8
  completed_phases: 4
  total_plans: 11
  completed_plans: 11
  percent: 100
---

# STATE: OpenOtter

**Project Started:** 2025-06-09
**Current Phase:** v1 complete — planning v2
**Current Focus:** Starting Milestone 2 (Integrations)

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-11)

**Core value:** Get audio conversations into Notion as searchable, shareable transcripts with minimal friction.
**Current focus:** Planning v2 Integrations milestone (Notion + AI summarization + email)

## Current Position

v1 MVP shipped 2026-06-11 — app live at otter.gsdlabs.dev
4 phases complete, 11 plans done. Starting fresh for v2.

```
Progress: v1 complete ✅ | v2 planning next
```

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files | Completed |
|-------|------|----------|-------|-------|-----------|
| 01 | 01-01 | 18.5 minutes | 4 | 7 | 2025-06-09 |
| 01 | 01-02 | 12 minutes | 3 | 3 | 2026-06-09 |
| 01 | 01-03 | 8 minutes | 6 | 7 | 2026-06-09 |

## Accumulated Context

### Key Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| Name: OpenOtter | Accepts trademark risk with Otter.ai similarity | Pending |
| Tech stack: AssemblyAI + Claude API + Notion API + Next.js/Vercel | Proposed stack, must be validated during research phase | Pending |
| AI provider flexibility | Wants ability to switch from Claude to other providers | Pending |
| Notion layout template | Research Otter.ai meeting layout and Notion "meeting" layout | Pending |
| Email notifications via Resend | Needed for failure notifications; Notion native notifications may not be reliable | Pending |

### Tech Stack (Proposed)

- **Frontend:** Next.js (Vercel deployment)
- **Transcription:** AssemblyAI (speaker diarization)
- **Summarization:** Claude API
- **Notion:** Notion API (OAuth integration)
- **Email:** Resend
- **Auth:** Cloudflare Access (single-user)
- **Storage:** Vercel Blob or similar (audio files)

### Blockers

None identified yet.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260609-ux1 | Implement local Hetzner filesystem storage solution (replacing Vercel Blob) | 2026-06-09 | 4e57cdc | [260609-ux1-implement-local-hetzner-filesystem-stora](./quick/260609-ux1-implement-local-hetzner-filesystem-stora/) |
| 260611-cyx | Restore Phase 1.5 plans from Vercel Postgres back to SQLite + local filesystem, and fix ROADMAP.md Vercel references | 2026-06-11 | 970d462 | [260611-cyx-restore-phase-1-5-plans-from-vercel-post](./quick/260611-cyx-restore-phase-1-5-plans-from-vercel-post/) |

### Todos

- Validate AssemblyAI for transcription + diarization
- Set up Notion OAuth integration
- Design Notion page layout template
- Configure email notifications via Resend
- Implement mobile-responsive UI

## Session Continuity

**Last Session:** 2026-06-11T19:06:40.434Z
**What Was Done:** Phase 1.5 (Recording Management) fully executed and verified. Fixed three production bugs discovered during UAT: (1) missing `filename` field in `/api/transcribe` request body causing Zod validation failure; (2) `ASSEMBLYAI_API_KEY` not propagating from env_file — added explicitly to ecosystem.config.js env block; (3) transcript page not passing `filename`/`filepath` as URL query params, so `saveRecording()` was never called on poll completion. Also fixed `formatDuration` in RecordingCard treating seconds as milliseconds (showing 0:00). Full pipeline verified end-to-end: upload → AssemblyAI transcription → SQLite save → recordings list → audio player + transcript display.

**Next Steps:**

1. Plan Phase 1.6 — MVP Mobile UI (iPhone Safari optimisation)
2. Plan Phase 1.7 — Hetzner Deployment (Cloudflare Tunnel + Access)
3. Then Milestone 2: Notion Integration, AI Summarization, Notifications

**Context for Next Session:**

- Phase 01 + 01.5 complete; app is live at otter.gsdlabs.dev (Cloudflare Access protected)
- SQLite DB at /home/services/openotter/openotter.db; uploads at /home/services/openotter/uploads/
- ecosystem.config.js has ASSEMBLYAI_API_KEY and OPENOTTER_RESEND_API_KEY hardcoded in env block (env_file alone was not propagating them)
- Phase 02 (Notion Integration) is planned with 3 plans ready to execute whenever Milestone 2 starts
- AssemblyAI audio_duration is in seconds; utterance start/end timestamps are in milliseconds

---

*Last updated: 2026-06-11*
