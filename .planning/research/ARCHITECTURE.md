# Architecture Research

**Domain:** Serverless audio transcription service
**Researched:** 2025-06-09
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Mobile Safari│  │ Upload Form  │  │ Status Page  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
├─────────┴──────────────────┴──────────────────┴─────────────┤
│                    API Layer (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │ POST /upload│  │ GET /status │  │ POST /webhook    │  │
│  │ Route Handler│ │Route Handler│ │AssemblyAI Handler│  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────────┘  │
│         │                 │                 │              │
├─────────┴─────────────────┴─────────────────┴──────────────┤
│                   Service Layer                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │FileService   │  │Transcription │  │NotionService    │ │
│  │Upload→Store  │  │Submit→Poll   │  │Format→Create    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────────┘ │
│         │                 │                 │             │
├─────────┴─────────────────┴─────────────────┴─────────────┤
│                   External Services                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Vercel Blob│  │AssemblyAI│  │  Claude  │  │ Notion   │  │
│  │ Storage   │  │  API     │  │   API    │  │   API    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Upload Route Handler** | Receive multipart file, validate, initiate upload flow | Next.js Route Handler (POST) |
| **File Service** | Upload to Vercel Blob, return storage URL | Vercel Blob SDK `put()` |
| **Transcription Service** | Submit AssemblyAI job with webhook config, track status | AssemblyAI SDK `submit()` |
| **Webhook Handler** | Receive AssemblyAI completion, fetch full transcript, trigger downstream | Next.js Route Handler (POST) with auth |
| **Summary Service** | Call Claude API for conversation summary | HTTP request to Anthropic API |
| **Notion Service** | Format transcript+summary, create Notion page | Notion SDK `pages.create()` |
| **Email Service** | Send success/failure notifications | Resend API |
| **Status Route Handler** | Poll job status for UI updates | Next.js Route Handler (GET) |

## Recommended Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── upload/             # Upload page route
│   │   └── page.tsx        # Upload form UI
│   ├── status/             # Status/check results page
│   │   └── [id]/           # Dynamic job status pages
│   │       └── page.tsx    # Status display + polling
│   ├── api/                # API routes
│   │   ├── upload/         # POST /api/upload
│   │   │   └── route.ts    # File upload handler
│   │   ├── status/         # GET /api/status/[id]
│   │   │   └── [id]/
│   │   │       └── route.ts # Job status polling
│   │   └── webhooks/       # Webhook receivers
│   │       ├── assemblyai/ # POST /api/webhooks/assemblyai
│   │       │   └── route.ts # AssemblyAI completion handler
│   │       └── auth.ts     # Webhook authentication middleware
│   └── layout.tsx          # Root layout with providers
├── services/               # Business logic layer
│   ├── file.service.ts     # Vercel Blob upload
│   ├── transcription.service.ts  # AssemblyAI integration
│   ├── summary.service.ts  # Claude API integration
│   ├── notion.service.ts   # Notion page creation
│   └── email.service.ts    # Resend notifications
├── lib/                    # Utilities and SDK clients
│   ├── assemblyai.ts       # AssemblyAI client singleton
│   ├── notion.ts           # Notion client singleton
│   ├── vercel-blob.ts      # Vercel Blob client
│   ├── resend.ts           # Resend client
│   └── claude.ts           # Claude API wrapper
├── types/                  # TypeScript types
│   ├── transcription.ts    # Transcript & utterance types
│   ├── job.ts              # Job status & metadata types
│   └── notion.ts           # Notion block types
└── middleware.ts           # Cloudflare Access integration
```

### Structure Rationale

- **`app/api/`:** Next.js Route Handlers handle HTTP requests — each route is a serverless function
- **`services/`:** Business logic separated from API layer — each service owns one external integration
- **`lib/`:** SDK client initialization and configuration — singletons to reuse connections
- **`types/`:** Strong typing for external API contracts — AssemblyAI utterances, Notion blocks
- **`middleware.ts`:** Cloudflare Access authentication at edge — no auth code in API routes

## Architectural Patterns

### Pattern 1: Async Webhook Processing

**What:** Submit transcription job immediately with webhook URL, return job ID to client, process results when AssemblyAI calls back.

**When to use:** Long-running operations (transcription takes minutes), serverless timeouts (Vercel functions max 10s for Hobby, 60s for Pro)

**Trade-offs:** 
- Pros: No serverless timeout issues, better UX (fire-and-forget), scalable
- Cons: Requires webhook endpoint, need retry logic for failed webhooks

**Example:**
```typescript
// transcription.service.ts
const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

export async function submitTranscription(audioUrl: string) {
  const transcript = await client.transcripts.submit({
    audio: audioUrl,
    speaker_labels: true,        // Diarization
    summarization: true,
    summary_model: 'summary_v2',
    summary_type: 'bullets',
    webhook_url: `${process.env.APP_URL}/api/webhooks/assemblyai`,
    webhook_auth_header_name: 'X-Webhook-Secret',
    webhook_auth_header_value: process.env.WEBHOOK_SECRET,
  });

  return transcript.id; // Return immediately
}

// app/api/webhooks/assemblyai/route.ts
export async function POST(request: Request) {
  // Verify webhook auth
  const auth = request.headers.get('X-Webhook-Secret');
  if (auth !== process.env.WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  if (data.status === 'completed') {
    // Fetch full transcript (webhook only sends ID)
    const transcript = await client.transcripts.get(data.transcript_id);
    
    // Process downstream
    await processCompletedTranscription(transcript);
  } else if (data.status === 'error') {
    await handleTranscriptionError(data.transcript_id, data.error);
  }

  return Response.json({ received: true });
}
```

### Pattern 2: Streaming File Upload

**What:** Use Next.js Route Handler with `request.formData()` to stream large files without size limits (Server Actions have 1MB default limit).

**When to use:** File uploads larger than 1MB (typical audio files), need to bypass Server Action limits

**Trade-offs:**
- Pros: No file size limits, true streaming, works on Vercel
- Cons: Manual streaming handling, no automatic progress feedback

**Example:**
```typescript
// app/api/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  // Upload to Vercel Blob (streaming, no size limit)
  const blob = await put(file.name, file, {
    access: 'public',
  });

  // Submit transcription job
  const jobId = await submitTranscription(blob.url);

  return Response.json({ 
    jobId,
    status: 'processing',
    uploadedAt: new Date().toISOString(),
  });
}
```

### Pattern 3: Service Layer External API Integration

**What:** Each external API (AssemblyAI, Notion, Claude) gets a dedicated service class that encapsulates all API calls and error handling.

**When to use:** Multiple external integrations, need retry logic, want to swap providers later

**Trade-offs:**
- Pros: Clean separation, easy testing, can mock services, straightforward to swap providers
- Cons: More boilerplate, indirect for simple operations

**Example:**
```typescript
// services/notion.service.ts
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function createTranscriptPage(
  parentPageId: string,
  transcript: Transcript,
  summary: string
) {
  const blocks = formatTranscriptBlocks(transcript);
  
  const page = await notion.pages.create({
    parent: { page_id: parentPageId },
    properties: {
      title: {
        title: [{ text: { content: transcript.metadata?.title || 'Transcript' } }],
      },
    },
    children: blocks,
  });

  return page;
}

function formatTranscriptBlocks(transcript: Transcript) {
  // Convert transcript utterances to Notion blocks
  const blocks = [
    {
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: [{ text: { content: 'Summary' } }] },
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: [{ text: { content: transcript.summary } }] },
    },
    // ... more blocks
  ];

  return blocks;
}
```

## Data Flow

### Upload Flow

```
[User selects file on mobile Safari]
    ↓
[POST /api/upload with multipart FormData]
    ↓
[Route Handler validates file type/size]
    ↓
[FileService uploads to Vercel Blob → returns URL]
    ↓
[TranscriptionService submits AssemblyAI job with webhook URL]
    ↓
[Return { jobId, status: 'processing' } to client]
    ↓
[Client redirects to /status/[jobId] for polling]
```

### Async Processing Flow

```
[AssemblyAI completes transcription]
    ↓
[POST /api/webhooks/assemblyai with { transcript_id, status: 'completed' }]
    ↓
[Webhook handler verifies auth header]
    ↓
[Fetch full transcript from AssemblyAI API]
    ↓
[SummaryService calls Claude API for enhanced summary]
    ↓
[NotionService formats and creates Notion page]
    ↓
[EmailService sends success notification with link]
    ↓
[Return 200 OK to AssemblyAI]
```

### Status Polling Flow

```
[GET /api/status/[jobId]]
    ↓
[Query database/job store for current status]
    ↓
[Return { status, transcript?, notionUrl?, error? }]
    ↓
[Client polls every 5s until status === 'completed' || 'error']
```

### Key Data Flows

1. **Upload to Storage:** User → API Route → Vercel Blob (returns public URL)
2. **Transcription Submission:** Vercel Blob URL → AssemblyAI (returns job ID)
3. **Async Completion:** AssemblyAI → Webhook → Services (Notion + Email)
4. **Status Polling:** Client → API Route → Job Store (in-memory or DB)

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Single Vercel project, in-memory job tracking, no database needed |
| 1k-100k users | Add Vercel Postgres for job persistence, queue for webhooks, background job processing |
| 100k+ users | Consider dedicated server for file processing, CDN for audio storage, separate webhook service |

### Scaling Priorities

1. **First bottleneck:** Vercel Blob storage egress limits — mitigate by using private blobs + signed URLs for transcription only
2. **Second bottleneck:** AssemblyAI API rate limits — implement queue/exponential backoff for submissions
3. **Third bottleneck:** Webhook reliability — add retry logic, dead letter queue for failed webhooks

## Anti-Patterns

### Anti-Pattern 1: Synchronous Transcription in Serverless

**What people do:** Call AssemblyAI and wait for completion in the same request using `transcribe()` instead of `submit()`.

**Why it's wrong:** Transcription takes minutes. Vercel serverless functions timeout at 10s (Hobby) or 60s (Pro). Request will fail before transcription completes.

**Do this instead:** Use `submit()` with webhook URL for async processing. Return job ID immediately, let webhook handle completion.

### Anti-Pattern 2: Server Actions for Large File Uploads

**What people do:** Use Next.js Server Actions (`'use server'`) to handle file uploads.

**Why it's wrong:** Server Actions have 1MB default body size limit. Audio files routinely exceed this (5 minutes = ~5MB). You'll hit `413 Payload Too Large`.

**Do this instead:** Use Route Handlers (`app/api/upload/route.ts`) with `request.formData()` — no size limits, full streaming support.

### Anti-Pattern 3: No Webhook Authentication

**What people do:** Accept webhook requests without verifying authenticity.

**Why it's wrong:** Anyone can POST to your webhook endpoint and trigger downstream actions (Notion page creation, emails). Security vulnerability.

**Do this instead:** Use AssemblyAI's `webhook_auth_header_name` and `webhook_auth_header_value` config. Verify header in webhook handler before processing.

### Anti-Pattern 4: Storing Files in Serverless Function Memory

**What people do:** Read entire file into memory in serverless function before processing.

**Why it's wrong:** Serverless functions have memory limits (1024MB-4096MB depending on plan). Large audio files + processing = OOM kills.

**Do this instead:** Stream files directly to Vercel Blob storage, pass URL to AssemblyAI. Never load full file in function memory.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **AssemblyAI** | SDK (`assemblyai` npm) | Use `submit()` not `transcribe()`, webhook auth required |
| **Vercel Blob** | SDK (`@vercel/blob`) | Streaming upload via `put()`, returns public URL |
| **Notion** | SDK (`@notionhq/client`) | OAuth flow for workspace access, `pages.create()` with blocks |
| **Claude API** | HTTP (` Anthropic` SDK or `fetch`) | POST to messages endpoint, handle rate limits |
| **Resend** | SDK (`resend`) | Simple `sendEmail()` call, template HTML emails |
| **Cloudflare Access** | Middleware edge auth | Zero-code auth via dashboard, no implementation needed |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **API ↔ Services** | Direct function calls | Services are imported modules, not HTTP APIs |
| **Services ↔ External APIs** | SDK calls or HTTP | Each service owns its client connection |
| **Webhook → Services** | Sequential async/await | Error handling critical — one failure breaks chain |

## Build Order Implications

### Phase 1: Foundation (Can build in parallel)
1. **Upload API + Vercel Blob** — Core input mechanism, no dependencies
2. **AssemblyAI integration** — Transcription service, mock webhook handler
3. **Status polling** — Simple in-memory job tracking

### Phase 2: Webhook Processing (Depends on Phase 1)
1. **Real webhook handler** — Replace mock with actual AssemblyAI webhook
2. **Notion integration** — Requires completed transcript structure
3. **Email notifications** — Requires Notion URL from step above

### Phase 3: Polish & Auth (Depends on Phase 2)
1. **Notion OAuth** — One-time workspace authorization flow
2. **Cloudflare Access** — Edge authentication (zero-code, dashboard only)
3. **Error handling & retry logic** — Webhook failures, API rate limits

### Dependency Graph
```
Upload API → AssemblyAI → Webhook Handler → Notion Service → Email Service
Status API → (no dependencies, just reads job state)
Notion OAuth → (can be added anytime, requires Notion integration first)
```

**Critical path:** Upload → Transcription → Webhook → Notion → Email

**Can parallelize:** Status API, UI components, Notion OAuth setup

## Sources

- AssemblyAI Official Documentation (HIGH confidence) — webhook patterns, async submission, Node.js SDK
- Notion API Reference (HIGH confidence) — page creation, block structure, authentication
- Next.js Route Handlers (HIGH confidence) — file upload patterns, streaming, size limits
- Vercel Blob Documentation (HIGH confidence) — streaming upload, public/private storage
- Context7 Library Research (HIGH confidence) — verified all SDK capabilities and patterns

---
*Architecture research for: Serverless audio transcription service*
*Researched: 2025-06-09*
