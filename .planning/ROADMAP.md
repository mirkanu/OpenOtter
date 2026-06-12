# ROADMAP: OpenOtter

**Created:** 2025-06-09
**Last Updated:** 2026-06-11 (v1 milestone closed)
**Granularity:** Coarse
**Coverage:** 7/7 requirements mapped

## Milestones

- ✅ **v1 MVP** — Phases 1, 1.5, 1.6, 1.7 (shipped 2026-06-11)
- 📋 **v2 Integrations** — Phases 2, 3, 4, 5 (planned)

## Phases

<details>
<summary>✅ v1 MVP (Phases 1, 1.5, 1.6, 1.7) — SHIPPED 2026-06-11</summary>

- [x] Phase 1: Audio Processing Core (3/3 plans) — completed 2026-06-09
- [x] Phase 1.5: Recording Management (3/3 plans) — completed 2026-06-11
- [x] Phase 1.6: MVP Mobile UI (4/4 plans) — completed 2026-06-11
- [x] Phase 1.7: Hetzner Deployment (1/1 plan) — completed 2026-06-11

Full archive: .planning/milestones/v1-ROADMAP.md

</details>

### 📋 v2 Integrations (Planned)

- [ ] **Phase 2: Notion Integration** - Create formatted pages with transcripts
- [ ] **Phase 3: AI Summarization** - Generate conversation summaries
- [ ] **Phase 4: Notifications** - Email alerts for success/failure
- [ ] **Phase 5: Mobile UI** - Full mobile experience with Notion OAuth

## Phase Details

### Phase 2: Notion Integration
**Goal**: Transcripts automatically appear as formatted pages in user's Notion workspace
**Depends on**: Phase 1
**Requirements**: NOTN-01
**Success Criteria** (what must be TRUE):
  1. User can authorize Notion workspace access via one-time OAuth flow
  2. System automatically creates new Notion page with transcript content after processing
  3. Notion page includes formatted transcript with speaker labels, metadata (date, duration, speaker count)
  4. Notion page is created in user's designated workspace/parent page
**Plans**: 3 plans

#### Plan 02-01: OAuth Authorization Flow
**Objective**: Implement Notion OAuth 2.0 authorization flow to enable workspace access
**Wave**: 1 (no dependencies)
**Tasks**: 4 tasks (OAuth helpers, authorize endpoint, callback endpoint, environment variables)

#### Plan 02-02: Notion Client and Block Formatting
**Objective**: Initialize Notion client and create transcript-to-block conversion utilities
**Wave**: 2 (depends on 02-01)
**Tasks**: 3 tasks (Notion client, type extensions, block conversion utilities)

#### Plan 02-03: Page Creation and Setup UI
**Objective**: Create Notion page from transcript and build setup UI for OAuth initiation
**Wave**: 3 (depends on 02-01, 02-02)
**Tasks**: 3 tasks (page creation endpoint, setup UI, parent page configuration)

### Phase 3: AI Summarization
**Goal**: Conversations include high-level AI-generated summaries for quick review
**Depends on**: Phase 1 (transcript required)
**Requirements**: SUMM-01
**Success Criteria** (what must be TRUE):
  1. System generates bullet-point summary of key conversation points
  2. Summary captures main topics, decisions, and action items discussed
  3. Summary is included alongside transcript in output (for Notion integration)
  4. Summary quality is sufficient for user to understand conversation without reading full transcript
**Plans**: TBD

### Phase 4: Notifications
**Goal**: User knows when processing is complete or if errors occur
**Depends on**: Phase 1, Phase 2, Phase 3
**Requirements**: NOTN-02, NOTN-03
**Success Criteria** (what must be TRUE):
  1. User receives email notification when processing completes successfully
  2. Success email includes direct link to created Notion page and conversation summary
  3. User receives email notification if processing fails with error details
  4. Email notifications arrive within reasonable time after processing completes/fails
**Plans**: TBD

### Phase 5: Mobile UI
**Goal**: User can complete entire workflow from mobile device (iPhone Safari)
**Depends on**: Phase 4
**Requirements**: UI-01
**Success Criteria** (what must be TRUE):
  1. User can access and authenticate to site via Safari on iOS
  2. Upload interface works smoothly on mobile device (file picker from Voice Memos)
  3. Pages are responsive and readable on mobile screen sizes
  4. User can authorize Notion OAuth and view status from mobile device
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Audio Processing Core | v1 | 3/3 | Complete | 2026-06-09 |
| 1.5. Recording Management | v1 | 3/3 | Complete | 2026-06-11 |
| 1.6. MVP Mobile UI | v1 | 4/4 | Complete | 2026-06-11 |
| 1.7. Hetzner Deployment | v1 | 1/1 | Complete | 2026-06-11 |
| 2. Notion Integration | v2 | 0/3 | Not started | - |
| 3. AI Summarization | v2 | 0/2 | Not started | - |
| 4. Notifications | v2 | 0/2 | Not started | - |
| 5. Mobile UI | v2 | 0/3 | Not started | - |

---

## Dependencies

**v2 (Integrations):**
```
Phase 2 (Notion Integration) ← depends on Phase 1
    ↓
Phase 3 (AI Summarization) ← depends on Phase 1 (transcript)
    ↓
Phase 4 (Notifications) ← depends on Phase 1, 2, 3
    ↓
Phase 5 (Mobile UI) ← depends on Phase 4
```

## Coverage Summary

**v1 Requirements:** 3/7 validated (AUDIO-01, TRAN-01, UI-01)
**v2 Requirements:** 4 carry-forward (SUMM-01, NOTN-01, NOTN-02, NOTN-03)

| Requirement | Phase | Milestone |
|-------------|-------|-----------|
| AUDIO-01 | Phase 1 | v1 ✅ |
| TRAN-01 | Phase 1 | v1 ✅ |
| UI-01 | Phase 1.6 + 1.7 | v1 ✅ |
| NOTN-01 | Phase 2 | v2 |
| SUMM-01 | Phase 3 | v2 |
| NOTN-02 | Phase 4 | v2 |
| NOTN-03 | Phase 4 | v2 |

---

*Last updated: 2026-06-11 — v1 milestone closed*
