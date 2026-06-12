# Domain Pitfalls

**Domain:** Audio transcription service with Notion integration
**Researched:** 2025-06-09

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Async Processing Orphaned Jobs
**What goes wrong:** Transcription jobs fail silently with no user notification. User uploads file, expects email confirmation, never hears back, doesn't know if file is processing or failed.

**Why it happens:** AssemblyAI webhooks can be missed (endpoint downtime, network failures). No fallback polling mechanism. No dead letter queue for failed notifications.

**Consequences:** 
- Users upload same file multiple times (wasting API credits)
- Zero trust in service
- Support burden: "Did my upload work?"
- Costs spiral from duplicate processing

**Prevention:**
- Implement webhook retry logic with exponential backoff
- Add fallback polling if webhook not received within expected timeframe
- Store job state in database: `uploaded → processing → completed/failed`
- Send email on ALL terminal states (success AND failure)
- Add "processing status" page users can check manually

**Detection:** Monitor for jobs stuck in `processing` state >30 minutes. Alert on webhook delivery failures.

**Phase to address:** Core Transcription Phase (must ship with robust async handling)

---

### Pitfall 2: Notion API Rate Limit Exhaustion
**What goes wrong:** Notion page creation fails mid-transcription due to rate limits. Transcription completes successfully but can't create Notion page. User gets success email but no Notion page exists.

**Why it happens:** Notion API allows ~3 requests/second per connection. Creating formatted pages with many blocks (transcript + summary) can exceed this. No rate limit handling built-in.

**Consequences:**
- Transcription succeeds but Notion creation fails silently
- User charged for transcription but gets no output
- Data loss: transcript exists in AssemblyAI but nowhere else
- User must manually re-run Notion creation (if you build recovery tool)

**Prevention:**
- Implement request queuing with exponential backoff
- Batch block creation in chunks (not all blocks at once)
- Monitor `X-RateLimit-*` response headers from Notion API
- Store transcript in database before Notion creation (for recovery)
- Add Notion creation retry logic with distinct error handling
- Fallback: Email transcript to user if Notion creation fails

**Detection:** Alert on 429 responses from Notion API. Monitor Notion creation failure rate.

**Phase to address:** Notion Integration Phase (critical path feature)

---

### Pitfall 3: File Size Mismatch and Format Errors
**What goes wrong:** iPhone Voice Memo files fail transcription with "audio duration too short" or inconsistent duration errors. Files that work in desktop apps fail in web app.

**Why it happens:** 
- AssemblyAI minimum duration: 160ms (files shorter rejected)
- Max file size: 2.2GB for local uploads
- Duration inconsistencies between tools (ffprobe, SoX, MediaInfo)
- iPhone Voice Memo format differences (stereo vs mono, sample rates)

**Consequences:**
- 10-30% of mobile uploads fail (user frustration)
- Support burden troubleshooting audio formats
- Users blame service for "broken" uploads
- Churn to competitors with better format handling

**Prevention:**
- Validate file size before upload (reject >2GB client-side)
- Check audio duration with ffprobe after upload
- Transcode problematic files to 16kHz WAV using FFmpeg
- Support all AssemblyAI formats: .m4a, .mp3, .wav, .ogg, .opus
- Test specifically with iPhone Voice Memo format variations
- Show clear error message if file too short (<160ms)

**Detection:** Track transcription failure reasons. Alert if "audio duration" errors >5% of uploads.

**Phase to address:** Mobile Upload Phase (test thoroughly with iPhone Voice Memos)

---

### Pitfall 4: Speaker Diarization Accuracy Collapse
**What goes wrong:** Speaker labels are wrong or split inconsistently. Same speaker labeled as "Speaker A" and "Speaker C" randomly. Users can't trust who said what.

**Why it happens:**
- Setting `max_speakers_expected` too high reduces accuracy
- Insufficient audio per speaker (short utterances)
- Poor audio quality or overlapping speech
- Too many speakers (>4-5 reduces accuracy significantly)

**Consequences:**
- Core feature (speaker diarization) becomes unusable
- Transcript loses value (don't know who said what)
- Users export to manual editing tools
- Product differentiation lost

**Prevention:**
- Set conservative `max_speakers_expected` (2-4 for conversations)
- Allow users to override if more speakers present
- Show confidence scores for speaker assignments
- Provide audio quality guidelines pre-upload
- Fallback: Offer option to disable diarization for difficult audio
- Test with real multi-speaker recordings (not ideal conditions)

**Detection:** Track speaker label switches per minute (high frequency = poor diarization). Survey users on accuracy.

**Phase to address:** Transcription Enhancement Phase (optimize after MVP)

---

## Moderate Pitfalls

### Pitfall 1: AssemblyAI API Rate Limit Exhaustion
**What goes wrong:** Multiple concurrent uploads trigger rate limits. Subsequent transcription requests fail during busy periods.

**Why it happens:** AssemblyAI rate limits based on account tier. No request throttling built-in. Bulk uploads (user testing) exhaust quota.

**Consequences:**
- Failed uploads during periods of heavy use
- Poor user experience during demos or testing
- Wasted API credits on retried failed requests

**Prevention:**
- Implement client-side rate limiting (max 1 upload per 5 seconds)
- Queue transcription requests server-side
- Handle 429 errors with exponential backoff retry
- Show "queue position" to users during heavy load
- Monitor AssemblyAI usage vs. quota

**Detection:** Alert on AssemblyAI 429 responses. Track failed requests due to rate limits.

**Phase to address:** Core Transcription Phase (add queuing before handling concurrency)

---

### Pitfall 2: Email Notification Delivery Failures
**What goes wrong:** Success/failure emails never arrive. User completes upload, checks Notion, sees nothing, assumes service broken.

**Why it happens:**
- Resend API rate limits (5 requests/second default)
- Email quota exceeded (daily/monthly limits)
- Invalid email address in user profile
- Email marked as spam (poor deliverability)

**Consequences:**
- No notification on job completion
- Users repeatedly check status page (if exists)
- Support emails: "Is my transcription done?"
- Perceived unreliability

**Prevention:**
- Validate email addresses format before storage
- Implement Resend rate limiting (max 3 requests/second)
- Monitor Resend quota usage and alert before exhaustion
- Add fallback: Show status in web UI
- Use proper SPF/DKIM records for email domain
- Test email deliverability during development

**Detection:** Alert on Resend 429 errors. Track email delivery rates (should be >98%).

**Phase to address:** Notification Phase (test email end-to-end)

---

### Pitfall 3: Webhook Timeout and Retry Storms
**What goes wrong:** AssemblyAI webhook endpoint times out or returns 500. AssemblyAI retries webhook, causing duplicate processing of same transcription.

**Why it happens:** 
- Webhook handler does heavy processing (Notion creation, summarization)
- No idempotency key handling
- Slow response to webhook (>30 second timeout)

**Consequences:**
- Duplicate Notion pages created
- Duplicate email notifications sent
- Database race conditions
- Wasted API credits

**Prevention:**
- Return 200 OK immediately, queue processing async
- Use idempotency keys for all operations
- Make webhook handler lightweight (just acknowledge receipt)
- Process webhooks via background job queue
- Dedupe by transcription ID before processing
- Test webhook timeout scenarios locally

**Detection:** Monitor webhook handler response times (p99 <1s). Alert on duplicate transcription IDs.

**Phase to address:** Core Transcription Phase (webhook handling is critical)

---

### Pitfall 4: Audio Format Incompatibility from Mobile
**What goes wrong:** Mobile recordings (especially iPhone Voice Memos) have format quirks that cause transcription failures. Stereo files, variable sample rates, or container format issues.

**Why it happens:**
- iPhone Voice Memos use stereo by default (AssemblyAI prefers mono)
- Sample rate variations (44.1kHz vs 16kHz vs 48kHz)
- Container format issues (m4a vs mp4 vs mpeg)
- Metadata corruption in mobile recording apps

**Consequences:**
- High mobile upload failure rate (core user segment affected)
- User confusion: "Works on desktop, fails on phone"
- Support burden diagnosing audio issues
- Users switch to more compatible competitors

**Prevention:**
- Test extensively with iPhone Voice Memo exports
- Transcode to 16kHz mono WAV before sending to AssemblyAI
- Support wide range of formats: m4a, mp3, wav, ogg, opus
- Show clear error messages for unsupported formats
- Provide format checker pre-upload
- Document mobile upload best practices

**Detection:** Track upload failure rates by file format. Alert if m4a/mp4 failures >10%.

**Phase to address:** Mobile Upload Phase (primary use case, must work flawlessly)

---

## Minor Pitfalls

### Pitfall 1: Long-Running Transcription User Timeout
**What goes wrong:** 1-hour audio file takes 10+ minutes to process. User assumes upload failed, refreshes page, resubmits file.

**Why it happens:** AssemblyAI processing time varies by duration and model. No clear expectation set with user. Real-time progress not shown.

**Consequences:**
- Duplicate submissions (wasted API credits)
- User anxiety about whether upload worked
- Poor perceived performance

**Prevention:**
- Show expected processing time based on audio duration
- Display "processing complete" estimate on status page
- Send email immediately on completion (don't wait for user to check)
- Show transcript progress bar (queued → processing → completing)
- Document processing time expectations in UI

**Detection:** Track duplicate submission rate. Alert if >5% of uploads are resubmits within 10 minutes.

**Phase to address:** Core Transcription Phase (manage user expectations early)

---

### Pitfall 2: Notion OAuth Token Expiry
**What goes wrong:** User's Notion OAuth token expires. Page creation fails with 401 Unauthorized. User must re-authenticate.

**Why it happens:** OAuth tokens have expiry times. No refresh token implementation. No token expiry pre-check.

**Consequences:**
- Sudden failure of Notion integration for existing users
- Manual re-authentication required
- Poor user experience

**Prevention:**
- Implement refresh token flow for Notion OAuth
- Check token validity before use
- Pre-emptively re-auth if token near expiry
- Show clear "reconnect Notion" message if auth fails
- Test token expiry scenarios during development

**Detection:** Alert on Notion 401 errors. Track OAuth refresh failures.

**Phase to address:** Notion Integration Phase (add refresh token flow from start)

---

### Pitfall 3: Summary Generation API Failures
**What goes wrong:** Claude API fails or times out during summary generation. Transcription exists but no summary. User expects both.

**Why it happens:**
- Claude API rate limits or outages
- Prompt too complex for context window
- API key exhausted or invalid
- Network timeout during LLM call

**Consequences:**
- Incomplete feature delivery (no summary)
- User disappointment (summary is value-add)
- Manual re-run required

**Prevention:**
- Make summary generation async (separate from transcription)
- Store raw transcript before summary attempt
- Retry summary generation with exponential backoff
- Fallback: Deliver transcript without summary (better than failure)
- Alert on summary failures separately from transcription failures
- Show "summary generation pending" status

**Detection:** Monitor Claude API error rates. Track summary generation success rate.

**Phase to address:** AI Enhancement Phase (add after core transcription is stable)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Mobile Upload** | Audio format incompatibility | Test iPhone Voice Memos extensively, add transcoding |
| **Core Transcription** | Webhook timeout / retry storms | Return 200 immediately, process async, add idempotency |
| **Core Transcription** | Orphaned async jobs | Implement webhook + polling fallback, email all terminal states |
| **Notion Integration** | Rate limit exhaustion | Add request queuing, monitor headers, implement retries |
| **AI Enhancement** | Speaker diarization accuracy | Set conservative max_speakers, show confidence, allow override |
| **AI Enhancement** | Summary generation failures | Store transcript first, make async, add retry logic |
| **Notifications** | Email delivery failures | Validate emails, rate limit Resend calls, add status page fallback |

## Sources

- [AssemblyAI Common Errors and Solutions](https://www.assemblyai.com/docs/pre-recorded-audio/guides/common_errors_and_solutions) - HIGH confidence (official docs)
- [AssemblyAI Rate Limits and Best Practices](https://www.assemblyai.com/docs/pre-recorded-audio/guides/bulk-transcription-and-load-tests-at-scale) - HIGH confidence (official docs)
- [AssemblyAI Speaker Diarization](https://www.assemblyai.com/docs/pre-recorded-audio/label-speakers) - HIGH confidence (official docs)
- [AssemblyAI File Size Limits](https://www.assemblyai.com/docs/faq/are-there-any-limits-on-file-size-or-file-duration-for-files-submitted-to-the-api) - HIGH confidence (official docs)
- [Notion API Rate Limits](https://developers.notion.com/reference/request-limits) - HIGH confidence (official docs)
- [Resend API Rate Limits](https://resend.com/docs/api-reference/rate-limit) - HIGH confidence (official docs)
- [AssemblyAI Audio Format Support](https://www.assemblyai.com/docs/faq/what-audio-and-video-file-types-are-supported-by-your-api) - HIGH confidence (official docs)
- [AssemblyAI Webhook Best Practices](https://www.assemblyai.com/docs/guides/webhooks) - MEDIUM confidence (based on official error handling docs)
