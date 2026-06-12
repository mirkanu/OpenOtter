# Feature Landscape

**Domain:** Audio transcription with speaker diarization
**Researched:** 2026-06-09
**Overall confidence:** HIGH

## Table Stakes

Features users expect in any transcription product. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Audio file upload | Core functionality | Low | Must accept common formats (MP3, WAV, M4A) from mobile Voice Memo apps |
| Speaker diarization | "Who said what" is defining feature | Medium | Industry expectation: 2-10 speakers identified reliably |
| Transcript editing | Typos and misattributions happen | Medium | Basic inline edit capability expected |
| Timestamp navigation | Jump to specific moments | Low | Click timestamp → jump to that point in audio |
| Search within transcript | Find specific topics quickly | Low | Full-text search across all transcripts |
| Export formats | Share transcripts externally | Low | TXT, PDF, DOCX minimum |
| Mobile-responsive UI | Most recordings happen on mobile | Medium | Safari on iOS must work flawlessly |
| Processing status indicator | Transparency during wait | Low | Progress bar or status updates during transcription |
| Basic summarization | AI baseline now | Medium | High-level bullet points of main topics |
| Email notification | Async workflow expectation | Low | Notify when processing complete (success/failure) |

**Confidence:** HIGH - Verified across Fireflies.ai, Grain, Otter.ai competitors and market research.

## Differentiators

Features that set OpenOtter apart from market leaders. Not expected, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Notion-native output | Direct integration into user's existing workspace (not another silo) | High | Most competitors only offer generic exports/CRM sync |
| Cost-effective usage-based pricing | No £20/month fixed cost for personal use | Low | Serverless/pay-per-use vs subscription incumbents |
| Personal-use optimization | No team features bloat, single-user focus | Low | Simpler UX, no permissions complexity |
| Open source transparency | User can self-host or modify if needed | High | Rare in transcription space (most are closed SaaS) |
| Mobile-first simplicity | Purpose-built for phone upload workflow | Medium | Competitors optimize for meeting capture bots |
| Flexible AI provider backend | Not locked into one transcription/AI provider | High | Switch between AssemblyAI, Deepgram, etc. |
| Optimized for conversation capture | Not tied to Zoom/Teams meetings | Low | Works with in-person recordings, phone calls, voice memos |
| Email failure notifications | Proactive error communication vs silent failures | Low | Most competitors only notify on success |

**Confidence:** MEDIUM - Based on competitive analysis and identified gap in market for personal-use, cost-effective option.

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-time transcription | Out of scope (batch processing only) | Clear UX: "Upload → Wait → Email" expectation |
| Meeting bot integrations (Zoom/Teams) | Adds complexity, single-user doesn't need scheduled meetings | Manual file upload workflow |
| Video processing | Out of scope (audio-only) | Accept audio files only, reject video |
| Multi-user auth & teams | Personal use only, protected by Cloudflare Access | Single-user via Cloudflare Access (email-based) |
| CRM integrations (Salesforce/HubSpot) | Single-user doesn't need enterprise sales workflows | Notion integration covers workspace automation |
| Advanced Notion features (databases/cross-refs) | Keep first version simple, page creation only | Simple formatted page with transcript + summary |
| Mobile app | Web-only sufficient for iPhone Safari | Responsive web design |
| Recording capabilities (browser/mic) | Users already have Voice Memo apps | Accept uploaded files only |
| Subscription pricing | User wants usage-based, avoid fixed monthly costs | Pay-per-use model aligned with serverless costs |

**Confidence:** HIGH - Explicitly defined in PROJECT.md out-of-scope section.

## Feature Dependencies

```
Audio file upload → Transcription → Summary → Notion page creation → Email notification
                                                    ↓
                              Notion OAuth (one-time setup)
```

**Dependency notes:**
- Speaker diarization happens during transcription (not separate step)
- Email notification requires success/failure state from Notion creation
- Notion OAuth must complete before any page creation can happen
- Summary generation depends on completed transcription

## MVP Recommendation

**Prioritize for first version:**

1. Mobile audio file upload (table stakes - core functionality)
2. Transcription with speaker diarization (table stakes - defining feature)
3. Basic summarization (table stakes - AI baseline)
4. Notion page creation with transcript + summary (key differentiator)
5. Email notifications (success + failure) (table stakes + differentiator)
6. Mobile-responsive UI (table stakes - primary use case)

**Defer:**
- Transcript editing (ship V1 without, add V2 if needed)
- Search functionality (ship V1 without, add V2 if needed)
- Multiple export formats (ship V1 with Notion only, add exports later)
- Advanced AI features (keep summary simple initially)

**Rationale:** Focus on the core value proposition (audio → Notion transcript) with minimum viable feature set. The primary differentiator is Notion integration + cost-effectiveness, not feature richness.

## Market Position

**OpenOtter fills:**
- Personal-use gap (most competitors target enterprise teams)
- Cost gap (Otter.ai at £20/month vs pay-per-use serverless)
- Integration gap (direct Notion output vs generic exports)

**OpenOtter does NOT compete on:**
- Feature richness (will never have meeting bots, CRM integrations)
- Real-time capabilities (batch processing only)
- Enterprise compliance (SOC 2, HIPAA out of scope for personal use)

**Target user:** Solo productivity enthusiast who wants frictionless audio → Notion workflow and is cost-conscious.

## Sources

- Fireflies.ai official website (HIGH confidence - primary source)
- Grain.com official website (HIGH confidence - primary source)
- Notion API documentation via Context7 (HIGH confidence - technical reference)
- OpenOtter PROJECT.md (HIGH confidence - project constraints and scope)

**Confidence assessment:**
- Table stakes: HIGH - verified across multiple competitors
- Differentiators: MEDIUM - based on market gap analysis, less direct verification
- Anti-features: HIGH - explicitly defined in project scope
- Dependencies: HIGH - logical workflow dependencies verified
