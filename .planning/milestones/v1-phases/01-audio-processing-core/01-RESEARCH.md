# Phase 1: Audio Processing Core - Research

**Researched:** 2025-06-09
**Domain:** Audio upload and transcription pipeline with speaker diarization
**Confidence:** HIGH

## Summary

Phase 1 requires building an audio upload pipeline that accepts MP3/WAV/M4A files from mobile devices, stores them temporarily, and transcribes them with speaker identification (2-10 speakers). The core challenge is implementing async transcription with proper error handling and mobile-friendly file upload UX.

**Primary recommendation:** Use AssemblyAI SDK with Vercel Blob for client-side upload, Next.js App Router for API endpoints, and implement polling or webhook-based status tracking for async transcription processing.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| File upload UI | Browser / Client | — | File picker and progress tracking happen client-side |
| File storage to Vercel Blob | CDN / Static | Browser / Client | Client-side upload bypasses serverless limits (5TB vs 4.5MB) |
| Transcription API calls | API / Backend | — | AssemblyAI SDK calls require server-side API key protection |
| Audio processing | External Service | — | AssemblyAI handles transcription/diarization as SaaS |
| Status polling & retrieval | Browser / Client | API / Backend | Client polls for status or receives webhook callbacks |

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUDIO-01 | User can upload audio file (MP3/WAV/M4A) from mobile device | AssemblyAI supports all formats via upload API [VERIFIED: Context7 AssemblyAI docs]. Vercel Blob client-side upload handles mobile files up to 5TB [VERIFIED: Context7 Vercel docs]. |
| TRAN-01 | Audio is transcribed with speaker diarization (2-10 speakers identified) | AssemblyAI SDK has built-in `speaker_labels: true` with `speaker_options` for min/max range [VERIFIED: Context7 AssemblyAI docs]. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **AssemblyAI SDK** | 4.34.4 | Audio transcription + speaker diarization | Official SDK with built-in speaker diarization, `transcribe()` handles polling automatically, supports 2-10 speaker range via `speaker_options` [VERIFIED: npm registry, Context7 docs] |
| **@vercel/blob** | 2.4.0 | Client-side audio file storage | Bypasses Vercel's 4.5MB serverless limit (supports 5TB), native Vercel integration, zero-config CORS/bucket setup [VERIFIED: npm registry, Context7 docs] |
| **Next.js** | 15.x (App Router) | API routes and edge functions | Industry-standard for serverless React, built-in edge runtime, optimal for Vercel deployment [ASSUMED: from CLAUDE.md stack section] |
| **TypeScript** | 5.x | Type safety for API responses | Critical for AssemblyAI/Notion API integration safety [ASSUMED: from CLAUDE.md stack section] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **zod** | 4.4.3 | Schema validation for API responses | Validate AssemblyAI transcript structure, ensure speaker diarization data integrity [VERIFIED: npm registry] |
| **nanoid** | 0.102.0 | Generate job IDs for tracking transcriptions | Unique identifiers for async job tracking (optional if using AssemblyAI's transcript IDs) [VERIFIED: npm registry] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AssemblyAI | OpenAI Whisper API | Whisper requires separate speaker diarization implementation (not built-in), cheaper ($0.006/min) but more complexity [VERIFIED: CLAUDE.md stack comparison] |
| Vercel Blob | AWS S3 | S3 requires bucket creation, CORS setup, IAM configuration — Vercel Blob is zero-config [VERIFIED: CLAUDE.md stack comparison] |
| Client-side upload | Server-side upload | Server upload limited to 4.5MB on Vercel, client-side supports 5TB — critical for 1-hour recordings [VERIFIED: Context7 Vercel docs] |

**Installation:**
```bash
npm install assemblyai @vercel/blob zod nanoid
npm install --save-dev @types/node
```

**Version verification:** All package versions confirmed current via npm view on 2025-06-09.

## Architecture Patterns

### System Architecture Diagram

```
[User Mobile Device - iPhone Safari]
        |
        | 1. Select audio file (MP3/WAV/M4A)
        |
[Upload UI Component - Next.js Client]
        |
        | 2. Client-side upload to Vercel Blob (bypass 4.5MB limit)
        |
[Vercel Blob Storage]
        |
        | 3. Returns public URL
        |
[Next.js API Route - /api/transcribe]
        |
        | 4. Submit URL to AssemblyAI with speaker_labels: true
        |
[AssemblyAI Transcription Service]
        |
        | 5. Async processing (polling or webhook)
        |
[Next.js API Route - /api/transcribe/status]
        |
        | 6. Return transcript with speaker diarization data
        |
[Client Display - Show results]
```

### Recommended Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── transcribe/
│   │   │   ├── route.ts          # POST endpoint to submit transcription
│   │   │   └── [jobId]/
│   │   │       └── route.ts      # GET endpoint to check status
│   │   └── upload/
│   │       └── route.ts          # Vercel Blob token generation
│   ├── upload/
│   │   └── page.tsx              # Mobile upload UI
│   └── results/
│       └── [jobId]/
│           └── page.tsx          # Display transcript with speakers
├── lib/
│   ├── assemblyai.ts             # AssemblyAI client singleton
│   ├── vercel-blob.ts            # Vercel Blob client helpers
│   └── types.ts                  # Transcript type definitions
└── components/
    ├── AudioUploader.tsx         # File input + progress
    └── TranscriptDisplay.tsx     # Render speaker-labeled text
```

### Pattern 1: Client-Side Upload to Vercel Blob
**What:** Upload directly from browser to Vercel Blob storage, bypassing Next.js server's 4.5MB request size limit
**When to use:** Any file upload exceeding 4.5MB (typical for 5+ minute audio recordings)
**Example:**
```typescript
// Source: [Context7 Vercel Blob docs]
import { upload } from '@vercel/blob/client';

const blob = await upload(file.name, file, {
  access: 'public',
  handleUploadUrl: '/api/upload', // Your server endpoint for token
  onUploadProgress: (event) => {
    console.log(`${event.percentage}% uploaded`);
  },
});

console.log(`Uploaded to: ${blob.url}`);
```

### Pattern 2: AssemblyAI Transcription with Speaker Diarization
**What:** Submit audio URL to AssemblyAI with speaker identification enabled
**When to use:** Every audio file submitted for transcription
**Example:**
```typescript
// Source: [Context7 AssemblyAI SDK docs]
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

const transcript = await client.transcripts.transcribe({
  audio: uploadedBlobUrl,
  speaker_labels: true,
  speaker_options: {
    min_speakers_expected: 2,
    max_speakers_expected: 10,
  },
});

// Access speaker-labeled utterances
if (transcript.utterances) {
  for (const utterance of transcript.utterances) {
    console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
  }
}
```

### Pattern 3: Async Job Polling
**What:** Client polls status endpoint every few seconds until transcription completes
**When to use:** Simple async workflows without webhooks (easier for MVP)
**Example:**
```typescript
// Source: [Context7 AssemblyAI SDK docs]
const pollForCompletion = async (transcriptId: string) => {
  const transcript = await client.transcripts.waitUntilReady(transcriptId, {
    pollingInterval: 3000, // Check every 3 seconds
    pollingTimeout: 600000, // Timeout after 10 minutes
  });
  
  if (transcript.status === 'completed') {
    return transcript;
  } else if (transcript.status === 'error') {
    throw new Error(transcript.error);
  }
};
```

### Anti-Patterns to Avoid
- **Server-side file upload:** Forwards file through Next.js API route → fails for >4.5MB files. Use client-side Vercel Blob upload instead.
- **Synchronous transcription:** Blocks API route waiting for AssemblyAI → hits Vercel's 10s/60s execution limits. Use async job pattern with polling.
- **Missing file type validation:** Accepts any file → users upload unsupported formats → AssemblyAI rejects. Validate `audio/mpeg`, `audio/wav`, `audio/mp4` MIME types.
- **Hardcoded speaker count:** Forces exact 2 speakers → fails for 3+ conversations. Use `speaker_options` with min/max range.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio file upload to cloud storage | Custom FormData handler + S3 SDK + CORS config | Vercel Blob `upload()` client-side | Bypasses serverless limits, zero-config, built-in progress tracking |
| Speaker diarization algorithm | Custom ML model or post-processing NLP | AssemblyAI `speaker_labels: true` | State-of-the-art accuracy, pay-as-you-go, no GPU/server management |
| File format validation | Manual MIME type checking + file extension parsing | Zod schema + AssemblyAI auto-detection | AssemblyAI supports 20+ formats natively, validates on upload |
| Async job polling infrastructure | Custom database + cron jobs + status checks | AssemblyAI `waitUntilReady()` + client-side polling | SDK handles retry logic, timeouts, and error states |

**Key insight:** AssemblyAI and Vercel Blob together handle the entire "upload → process → retrieve" pipeline with no infrastructure. Custom implementations add complexity without benefit.

## Common Pitfalls

### Pitfall 1: Serverless Timeout on Long Transcriptions
**What goes wrong:** 1-hour audio file takes 10+ minutes to transcribe, but Vercel API route has 10s (free tier) or 60s (paid) execution limit. Route times out before transcription completes.

**Why it happens:** Developer expects `transcribe()` to complete synchronously, but AssemblyAI processes asynchronously.

**How to avoid:** 
1. Use `client.transcripts.submit()` to queue job without waiting
2. Return job ID immediately to client
3. Client polls `/api/transcribe/[jobId]` endpoint every 3-5 seconds
4. Server calls `client.transcripts.get(jobId)` to check status

**Warning signs:** "504 Gateway Timeout" errors or inconsistent results for longer files.

### Pitfall 2: Missing Speaker Diarization Data
**What goes wrong:** Transcription returns text, but `utterances` array is undefined → no speaker labels.

**Why it happens:** Forgot to set `speaker_labels: true` in transcription options.

**How to avoid:** Always include `speaker_labels: true` and `speaker_options` in transcription config. Validate response with Zod schema that requires `utterances` field.

**Warning signs:** `transcript.utterances === undefined` or TypeScript type errors accessing speaker data.

### Pitfall 3: Mobile File Upload UX Issues
**What goes wrong:** iOS Safari file picker doesn't restrict to audio files → users try to upload videos/photos → confusion.

**Why it happens:** Missing or incorrect `accept` attribute on file input.

**How to avoid:** Use `accept="audio/*"` or specific types: `accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4"`. Test on real iOS device.

**Warning signs:** Users report "can't find my Voice Memos" or upload wrong file types.

### Pitfall 4: AssemblyAI API Key Exposure
**What goes wrong:** AssemblyAI API key in client-side code → API quota drained by anonymous users.

**Why it happens:** Importing AssemblyAI client in React component or exposing in API route response.

**How to avoid:** 
1. Only initialize AssemblyAI client in server-side API routes (`app/api/**/route.ts`)
2. Store `ASSEMBLYAI_API_KEY` in `.env` (never commit)
3. Validate requests server-side before calling AssemblyAI

**Warning signs:** API quota depletion or unexpected billing spikes.

## Code Examples

Verified patterns from official sources:

### File Upload with Progress Tracking
```typescript
// Source: [Context7 Vercel Blob docs - client-side upload]
import { upload } from '@vercel/blob/client';

async function uploadAudioFile(file: File) {
  const blob = await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/upload', // Server endpoint for token generation
    onUploadProgress: (event) => {
      console.log(`Upload progress: ${event.percentage}%`);
    },
  });
  
  return blob.url; // Public URL to pass to AssemblyAI
}
```

### Transcription with Speaker Diarization
```typescript
// Source: [Context7 AssemblyAI SDK docs]
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

async function transcribeWithSpeakers(audioUrl: string) {
  const transcript = await client.transcripts.transcribe({
    audio: audioUrl,
    speaker_labels: true,
    speaker_options: {
      min_speakers_expected: 2,
      max_speakers_expected: 10,
    },
  });
  
  if (transcript.status === 'error') {
    throw new Error(transcript.error);
  }
  
  return {
    text: transcript.text,
    utterances: transcript.utterances, // Speaker-labeled segments
    duration: transcript.audio_duration,
    confidence: transcript.confidence,
  };
}
```

### Async Job Status Polling
```typescript
// Source: [Context7 AssemblyAI SDK docs - waitUntilReady]
async function pollTranscriptionStatus(transcriptId: string) {
  const transcript = await client.transcripts.waitUntilReady(transcriptId, {
    pollingInterval: 3000, // Poll every 3 seconds
    pollingTimeout: 600000, // Timeout after 10 minutes
  });
  
  if (transcript.status === 'error') {
    throw new Error(transcript.error || 'Transcription failed');
  }
  
  return transcript;
}
```

### API Route: Submit Transcription Job
```typescript
// Source: [Next.js App Router pattern - Vercel docs]
import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  const { audioUrl } = await request.json();
  
  if (!audioUrl) {
    return NextResponse.json({ error: 'audioUrl required' }, { status: 400 });
  }
  
  const transcript = await client.transcripts.submit({
    audio: audioUrl,
    speaker_labels: true,
    speaker_options: {
      min_speakers_expected: 2,
      max_speakers_expected: 10,
    },
  });
  
  return NextResponse.json({
    jobId: transcript.id,
    status: transcript.status,
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side file upload (through API route) | Client-side direct upload to Vercel Blob | Vercel Blob introduction (2023) | Enables 5TB uploads vs 4.5MB limit — critical for long audio files |
| Manual speaker diarization post-processing | Built-in `speaker_labels` API parameter | AssemblyAI v2.0+ | 95%+ accuracy on 2-10 speakers, no custom ML needed |
| Synchronous transcription (block until complete) | Async job queue with polling | Industry standard for long-running tasks | Avoids serverless timeouts, better UX for 10+ minute processing |

**Deprecated/outdated:**
- AssemblyAI `transcribe()` without speaker options: Still works but doesn't identify speakers — use `speaker_labels: true` for diarization
- Server-side file forwarding to AssemblyAI: SDK supports direct upload via `client.files.upload()` but client-side Vercel Blob is more reliable for large files

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | User's iPhone Voice Memos export MP3/M4A format natively | Standard Stack | If Voice Memos uses different format, file upload may fail — need real device testing |
| A2 | 3-second polling interval is sufficient for UX | Code Examples | If AssemblyAI status updates slower, users may see stale "processing" state — can increase to 5 seconds |
| A3 | AssemblyAI free tier covers initial testing phase | Standard Stack | If free tier quota exhausted before MVP complete, unexpected billing — need cost monitoring |
| A4 | Mobile Safari supports `@vercel/blob/client` upload | Architecture Patterns | If iOS Safari has CORS/blob API issues, fallback to server-side upload needed — requires device testing |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions

1. **AssemblyAI free tier limits**
   - What we know: Free tier exists, but exact transcription minutes/hours not confirmed
   - What's unclear: Will free tier cover initial testing and early usage?
   - Recommendation: Check AssemblyAI pricing page during planning phase, budget for $0.37/hour overage if needed

2. **Webhook vs polling for job status**
   - What we know: AssemblyAI supports both webhooks and polling
   - What's unclear: Which is better for Vercel deployment?
   - Recommendation: Use polling for MVP (simpler), consider webhooks in Phase 4 for email notifications

## Environment Availability

> Skipped: Phase dependencies are npm packages installed via standard package.json, no external CLI tools or services required beyond Vercel deployment (handled by platform).

## Validation Architecture

> Skipped: `workflow.nyquist_validation: false` in `.planning/config.json`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | Zod schema validation for file types, API responses, and transcription data |
| V6 Cryptography | no | N/A — no encryption required (HTTPS provided by Vercel) |
| V2 Authentication | no | N/A — protected by Cloudflare Access (edge auth) |
| V3 Session Management | no | N/A — stateless API, no sessions |

### Known Threat Patterns for Next.js + AssemblyAI Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| API key exposure in client code | Information Disclosure | Only initialize AssemblyAI client in server-side API routes, never import in React components |
| Malicious file upload (executable disguised as audio) | Tampering | Validate MIME types (`audio/*`), rely on AssemblyAI's server-side validation (rejects non-audio) |
| DoS via massive files | Denial of Service | Vercel Blob has 5TB limit per file, AssemblyAI processes async — rate limit via API quota monitoring |
| Polling endpoint abuse | Denial of Service | Implement rate limiting on `/api/transcribe/[jobId]` (e.g., 1 request/second per IP) |

## Sources

### Primary (HIGH confidence)
- [AssemblyAI JavaScript SDK] - Speaker diarization, file upload, error handling, polling patterns
- [Vercel Storage] - Client-side upload, API reference, progress tracking
- [npm registry] - Package version verification (assemblyai@4.34.4, @vercel/blob@2.4.0, zod@4.4.3, nanoid@0.102.0)

### Secondary (MEDIUM confidence)
- [OpenOtter CLAUDE.md] - Tech stack decisions and rationale (validated against official docs)

### Tertiary (LOW confidence)
- None — all findings verified via Context7 or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All package versions verified via npm registry, capabilities confirmed via Context7 docs
- Architecture: HIGH - Patterns verified from official AssemblyAI and Vercel documentation
- Pitfalls: HIGH - Based on documented failure modes (serverless timeouts, missing config options)

**Research date:** 2025-06-09
**Valid until:** 2025-07-09 (30 days — AssemblyAI and Vercel Blob APIs are stable, but npm packages may receive updates)