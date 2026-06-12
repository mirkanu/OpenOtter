# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1 — MVP

**Shipped:** 2026-06-11
**Phases:** 4 | **Plans:** 11 | **Timeline:** 3 days (2026-06-09 → 2026-06-11)

### What Was Built

- Upload pipeline with AssemblyAI transcription and speaker diarization
- SQLite persistence layer with recordings list, audio proxy, and playback UI
- shadcn/ui design system with dark mode and mobile-first layout
- Cloudflare Access protection via automated API provisioning

### What Worked

- GSD phased approach kept scope tight — each phase had a clear goal and was shippable independently
- AssemblyAI SDK worked exactly as documented; speaker diarization was a one-line option
- Cloudflare API allowed fully automated Access setup — no manual dashboard steps needed
- shadcn/ui components dropped in cleanly with no bundle overhead and good mobile defaults

### What Was Inefficient

- Initial plans assumed Vercel (Blob + Postgres) — had to pivot to Hetzner local storage early, requiring a quick task and replanning
- PM2 `env_file` didn't propagate env vars as expected — cost a debugging session; needed explicit `env` block in `ecosystem.config.js`
- Phase 1.5 bugs (5 distinct issues) discovered during UAT — would have benefited from earlier local testing before running the full phase

### Patterns Established

- All secrets in `/home/services/.env.production`; PM2 `ecosystem.config.js` requires explicit `env:` block, not just `env_file:`
- Server components must not make loopback HTTP requests to Cloudflare Access–protected domains — use direct DB/service calls instead
- `AssemblyAI.audio_duration` is in seconds; utterance `start`/`end` timestamps are in milliseconds — keep this asymmetry in mind for any timeline UI
- SQLite with `better-sqlite3` and WAL mode is the right default for single-user Hetzner apps

### Key Lessons

1. **Test DB + API key propagation before declaring a phase done** — PM2 env propagation and AssemblyAI key issues were only found during UAT
2. **Cloudflare Access blocks server-side loopback requests** — any server component or API route that calls the same domain will get a 401; always call services directly
3. **Plan for Hetzner from day 1** — Vercel assumptions (Blob, Postgres, edge functions) require rework on a VPS; check CLAUDE.md constraints before planning
4. **shadcn/ui + Tailwind is genuinely fast for mobile UI** — Phase 1.6 delivered a polished mobile experience in 4 plans with minimal friction

### Cost Observations

- Model mix: ~100% sonnet (no haiku used, opus not needed for this scale)
- Sessions: ~5-6 sessions across 3 days
- Notable: Phase 1.7 was the most token-efficient — one plan, automated via API, verified in a single session

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1 MVP | 4 | 11 | Initial build — established Hetzner deployment patterns |

### Top Lessons (Verified Across Milestones)

1. *(Single milestone — trends to be established in v2+)*
