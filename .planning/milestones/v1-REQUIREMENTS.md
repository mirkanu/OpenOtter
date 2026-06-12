# Requirements Archive: v1 MVP

**Archived:** 2026-06-11
**Original file:** .planning/REQUIREMENTS.md
**Milestone:** v1 MVP (Phases 1, 1.5, 1.6, 1.7)

---

## v1 Requirements

### Core Functionality

- [x] **AUDIO-01**: User can upload audio file (MP3/WAV/M4A) from mobile device — ✓ Validated v1 (Phase 1)
- [x] **TRAN-01**: Audio is transcribed with speaker diarization (2-10 speakers identified) — ✓ Validated v1 (Phase 1)
- [ ] **SUMM-01**: AI generates high-level bullet point summary of conversation — deferred to v2 (Phase 3)

### Integration & Notifications

- [ ] **NOTN-01**: System creates formatted Notion page with transcript and summary — deferred to v2 (Phase 2)
- [ ] **NOTN-02**: User receives email notification on success (with Notion link) — deferred to v2 (Phase 4)
- [ ] **NOTN-03**: User receives email notification on failure (with error details) — deferred to v2 (Phase 4)

### User Interface

- [x] **UI-01**: Mobile-responsive interface works in Safari on iOS — ✓ Validated v1 (Phases 1.6 + 1.7)

## v2 Requirements (unchanged, carry forward)

### Transcript Features

- **TRAN-02**: Transcript editing capability
- **TRAN-03**: Timestamp navigation (click to jump to point)
- **TRAN-04**: Search within transcripts
- **TRAN-05**: Export formats (TXT, PDF, DOCX)

### User Experience

- **UI-02**: Processing status indicator

## Out of Scope (unchanged)

| Feature | Reason |
|---------|--------|
| Real-time transcription | Batch processing only (async workflow) |
| Meeting bot integrations (Zoom/Teams) | Adds complexity, single-user doesn't need scheduled meetings |
| Video processing | Audio-only files |
| Multi-user auth & teams | Personal use only, protected by Cloudflare Access |
| CRM integrations (Salesforce/HubSpot) | Single-user doesn't need enterprise sales workflows |
| Mobile app | Web-only sufficient for iPhone Safari |
| Recording capabilities (browser/mic) | Users already have Voice Memo apps |
| Subscription pricing | User wants usage-based, avoid fixed monthly costs |

## Traceability — Final Status

| Requirement | Phase | Final Status |
|-------------|-------|--------------|
| AUDIO-01 | Phase 1 | ✅ Validated v1 |
| TRAN-01 | Phase 1 | ✅ Validated v1 |
| UI-01 | Phases 1.6 + 1.7 | ✅ Validated v1 |
| NOTN-01 | Phase 2 | 📋 Deferred to v2 |
| SUMM-01 | Phase 3 | 📋 Deferred to v2 |
| NOTN-02 | Phase 4 | 📋 Deferred to v2 |
| NOTN-03 | Phase 4 | 📋 Deferred to v2 |

**v1 Coverage:** 3/7 requirements validated (AUDIO-01, TRAN-01, UI-01)
**v2 Carry-forward:** 4 requirements (SUMM-01, NOTN-01, NOTN-02, NOTN-03)

---

*Requirements archived: 2026-06-11 after v1 milestone close*
