---
title: Milestone 1 Reshuffle Rationale
date: 2026-06-10
context: Mid-phase milestone restructuring decision
---

## Why We Reshaped Milestone 1

**Decision:** Reduce Milestone 1 scope to MVP (upload → transcribe → list → play) and move Notion/AI/Email to Milestone 2.

**Motivation:** Get to a working MVP ASAP that provides immediate value. The original Milestone 1 (Phases 1-5) was trying to do too much - Notion integration, AI summarization, and email notifications are enhancements, not core value.

**What Changed:**

### Phase Structure
- **Milestone 1:** Phase 1 (Audio Core) → Phase 1.5 (Recording Management) → Phase 1.6 (MVP Mobile UI) → Phase 1.7 (Hetzner Deployment)
- **Milestone 2:** Phase 2 (Notion) → Phase 3 (AI Summarization) → Phase 4 (Notifications) → Phase 5 (Full Mobile UI)

### Infrastructure Decisions
- **Storage:** Hetzner local filesystem (`/home/services/openotter/uploads`), not Vercel Blob
- **Deployment:** Self-hosted on Hetzner, not Vercel
- **Networking:** Cloudflare Tunnel for otter.gsdlabs.dev → localhost:3000
- **Auth:** Cloudflare Access limited to manuelkuhs@gmail.com

### Usage-Based Scaling Rationale
At 2-10 hours audio/week max with 1-month retention, total storage is ~1-2GB. Hetzner local storage is simpler and cheaper than Vercel Blob for this scale.

**Outcome:** Milestone 1 delivers a immediately-useable tool. Milestone 2 adds the "nice-to-have" integrations.
