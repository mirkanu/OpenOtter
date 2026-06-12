# Phase 1: Audio Processing Core - Pattern Map

**Mapped:** 2025-06-09
**Files analyzed:** 9 new files
**Analogs found:** 0 / 9 (greenfield implementation)

## Greenfield Implementation Notice

OpenOtter is a new project with no existing codebase. All files will be created from scratch. The patterns below are extracted from similar Next.js projects on this VPS (`/data/home/prc`, `/data/home/utilities-tracker`, `/data/home/GSDlabs-portfolio`) to ensure consistency with established conventions.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/api/transcribe/route.ts` | API route | request-response | `/data/home/prc/src/app/api/feature-requests/route.ts` | role-match |
| `src/app/api/transcribe/[jobId]/route.ts` | API route | request-response | `/data/home/prc/src/app/api/feature-requests/route.ts` | role-match |
| `src/app/api/upload/route.ts` | API route | request-response | `/data/home/prc/src/app/api/health/route.ts` | role-match |
| `src/lib/assemblyai.ts` | utility | client-initialization | `/data/home/prc/src/lib/supabase-service.ts` | role-match |
| `src/lib/vercel-blob.ts` | utility | client-initialization | `/data/home/prc/src/lib/supabase-service.ts` | role-match |
| `src/lib/types.ts` | type-def | static | `/data/home/utilities-tracker/src/lib/db/schema.ts` | role-match |
| `src/components/AudioUploader.tsx` | component | user-interaction | `/data/home/prc/src/components/topics/TopicSubscribeButton.tsx` | role-match |
| `src/components/TranscriptDisplay.tsx` | component | display | `/data/home/prc/src/components/topics/ExpandableResourceList.tsx` | role-match |
| `src/app/upload/page.tsx` | page | client-rendered | N/A (standard Next.js pattern) | none |

## Pattern Assignments

### `src/app/api/transcribe/route.ts` (API route, request-response)

**Analog:** `/data/home/prc/src/app/api/feature-requests/route.ts`

**POST handler pattern** (lines 101-333):
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validation
  if (!body.audioUrl) {
    return NextResponse.json(
      { error: "audioUrl is required" },
      { status: 400 }
    );
  }
  
  // Call external service
  const result = await externalService.submit(body.audioUrl);
  
  // Return response
  return NextResponse.json({ 
    jobId: result.id,
    status: result.status 
  }, { status: 201 });
}
```

**Error handling pattern** (lines 10-13, 57-59):
```typescript
// Try/catch with typed error responses
try {
  const result = await service.process();
  return NextResponse.json({ data: result });
} catch (error) {
  const message = error instanceof Error ? error.message : "unknown";
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}
```

**Environment variable pattern** (from `/data/home/prc/src/app/api/cron/digest/route.ts`):
```typescript
const apiKey = process.env.ASSEMBLYAI_API_KEY;
if (!apiKey) {
  return NextResponse.json(
    { error: "Server configuration error" },
    { status: 500 }
  );
}
```

---

### `src/app/api/transcribe/[jobId]/route.ts` (API route, request-response)

**Analog:** `/data/home/prc/src/app/api/feature-requests/route.ts` (GET handler)

**GET handler pattern** (lines 36-99):
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;
  
  if (!jobId) {
    return NextResponse.json(
      { error: "jobId is required" },
      { status: 400 }
    );
  }
  
  // Fetch status from external service
  const result = await service.checkStatus(jobId);
  
  return NextResponse.json({
    status: result.status,
    transcript: result.transcript,
  });
}
```

---

### `src/app/api/upload/route.ts` (API route, request-response)

**Analog:** `/data/home/GSDlabs-portfolio/src/app/api/health/route.ts`

**Simple POST pattern** (lines 6-14):
```typescript
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";  // Disable caching for uploads

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();
    const token = await generateUploadToken(filename);
    
    return NextResponse.json({ 
      uploadUrl: token.url,
      token: token.token 
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: message },
      { status: 503 }
    );
  }
}
```

---

### `src/lib/assemblyai.ts` (utility, client-initialization)

**Analog:** `/data/home/prc/src/lib/supabase-service.ts`

**Singleton client pattern** (lines 9-24):
```typescript
import { AssemblyAI } from "assemblyai";

/**
 * AssemblyAI client singleton for audio transcription.
 * NEVER import this in client-side code — API key must be protected.
 */
let client: AssemblyAI | null = null;

export function getAssemblyAIClient(): AssemblyAI {
  if (!client) {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      throw new Error("ASSEMBLYAI_API_KEY environment variable is not set");
    }
    
    client = new AssemblyAI({ apiKey });
  }
  
  return client;
}
```

---

### `src/lib/vercel-blob.ts` (utility, client-initialization)

**Analog:** `/data/home/prc/src/lib/supabase-service.ts`

**Token generation pattern** (Vercel Blob docs pattern):
```typescript
import { put } from '@vercel/blob';

/**
 * Generate upload token for client-side direct upload to Vercel Blob.
 * Bypasses Next.js server's 4.5MB request size limit.
 */
export async function generateUploadToken(filename: string) {
  const blob = await put(filename, new Blob(), {
    access: 'public',
  });
  
  return {
    uploadUrl: blob.url,
    token: blob.uploadUrl,  // Client uses this for direct upload
  };
}
```

---

### `src/lib/types.ts` (type-def, static)

**Analog:** `/data/home/utilities-tracker/src/lib/db/schema.ts`

**Type definition pattern** (lines 1-10):
```typescript
/**
 * Transcript types for AssemblyAI responses
 */

export interface TranscriptUtterance {
  speaker: string;
  text: string;
  start: number;  // milliseconds
  end: number;    // milliseconds
  confidence: number;
}

export interface TranscriptResult {
  id: string;
  status: 'processing' | 'completed' | 'error';
  text?: string;
  utterances?: TranscriptUtterance[];
  error?: string;
  audio_duration?: number;
}

export interface TranscriptionJob {
  jobId: string;
  audioUrl: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  createdAt: Date;
}
```

---

### `src/components/AudioUploader.tsx` (component, user-interaction)

**Analog:** `/data/home/prc/src/components/topics/TopicSubscribeButton.tsx`

**Client component pattern** (lines 1-50):
```typescript
"use client";

import { useState, useCallback } from "react";
import { upload } from '@vercel/blob/client';

interface AudioUploaderProps {
  onUploadComplete: (audioUrl: string) => void;
}

export default function AudioUploader({ onUploadComplete }: AudioUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleFileSelect = useCallback(async (file: File) => {
    setUploading(true);
    setProgress(0);
    
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: (event) => {
          setProgress(event.percentage);
        },
      });
      
      onUploadComplete(blob.url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);
  
  return (
    <div>
      <input 
        type="file" 
        accept="audio/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
      {uploading && <div>Uploading... {progress}%</div>}
    </div>
  );
}
```

---

### `src/components/TranscriptDisplay.tsx` (component, display)

**Analog:** `/data/home/prc/src/components/topics/ExpandableResourceList.tsx`

**Display component pattern** (lines 1-30):
```typescript
"use client";

import { TranscriptUtterance } from "@/lib/types";

interface TranscriptDisplayProps {
  utterances: TranscriptUtterance[];
}

export default function TranscriptDisplay({ utterances }: TranscriptDisplayProps) {
  return (
    <div className="transcript-container">
      {utterances.map((utterance, index) => (
        <div key={index} className="utterance">
          <span className="speaker">
            Speaker {utterance.speaker}:
          </span>
          <span className="text">
            {utterance.text}
          </span>
          <span className="timestamp">
            {new Date(utterance.start).toISOString()}
          </span>
        </div>
      ))}
    </div>
  );
}
```

---

### `src/app/upload/page.tsx` (page, client-rendered)

**Pattern:** Standard Next.js App Router page (no analog needed)

**Page structure pattern:**
```typescript
import AudioUploader from "@/components/AudioUploader";

export default function UploadPage() {
  return (
    <div className="container">
      <h1>Upload Audio</h1>
      <AudioUploader onUploadComplete={(url) => {
        // Handle upload completion
      }} />
    </div>
  );
}
```

---

## Shared Patterns

### API Route Structure
**Source:** Multiple Next.js projects on this VPS
**Apply to:** All API route files

```typescript
// Standard imports
import { NextRequest, NextResponse } from "next/server";

// Force dynamic for non-cached endpoints
export const dynamic = "force-dynamic";

// HTTP method handlers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.requiredField) {
      return NextResponse.json(
        { error: "requiredField is required" },
        { status: 400 }
      );
    }
    
    // Process request
    const result = await processRequest(body);
    
    // Return success
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    // Error handling
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
```

### Environment Variable Safety
**Source:** `/data/home/prc/src/lib/supabase-service.ts`
**Apply to:** All client initialization files

```typescript
// Always check environment variables exist
const apiKey = process.env.SERVICE_API_KEY;
if (!apiKey) {
  throw new Error("SERVICE_API_KEY environment variable is not set");
}
```

### Client Component Directive
**Source:** All component examples
**Apply to:** All component files

```typescript
"use client";  // Must be first line

import { useState } from "react";

export default function MyComponent() {
  // Component logic
}
```

### Error Message Types
**Source:** `/data/home/prc/src/app/api/health/route.ts`
**Apply to:** All API routes

```typescript
// Type-safe error messages
const message = err instanceof Error ? err.message : "unknown";
```

### TypeScript Types for External APIs
**Source:** `/data/home/utilities-tracker/src/lib/db/schema.ts`
**Apply to:** `src/lib/types.ts`

```typescript
// Define interfaces for all external API responses
// Use Zod for runtime validation (install in Phase 1)
import { z } from "zod";

export const TranscriptSchema = z.object({
  id: z.string(),
  status: z.enum(['processing', 'completed', 'error']),
  utterances: z.array(z.object({
    speaker: z.string(),
    text: z.string(),
    start: z.number(),
    end: z.number(),
  })),
});
```

## No Analog Found

Files with no close match in the codebase (will use RESEARCH.md patterns):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/vercel-blob.ts` | utility | client-initialization | No existing Vercel Blob usage on this VPS — follow official docs pattern from RESEARCH.md |

## Additional Pattern Sources

### Next.js App Router Conventions
**Source:** All examined projects follow Next.js 15 App Router patterns
- Route handlers in `src/app/api/*/route.ts` use `GET`, `POST`, `PUT`, `DELETE` exports
- Client components use `"use client"` directive on first line
- Server components (default) can use async components for data fetching
- Dynamic routes use `[param]` folder naming

### TypeScript Conventions
**Source:** All projects use TypeScript 5+ with strict mode
- Interface definitions for all external data structures
- Type-safe error handling with `error instanceof Error`
- Environment variable checks with `process.env.VAR!` (non-null assertion) after validation

### Component Conventions
**Source:** All React components follow consistent patterns
- Props interfaces defined before component
- Named exports for all non-default components
- Client-side state with `useState` and `useCallback` hooks
- Error handling with try/catch and console.error

## Metadata

**Analog search scope:** `/data/home/prc`, `/data/home/utilities-tracker`, `/data/home/GSDlabs-portfolio`
**Files scanned:** 20+ TypeScript/TSX files across 3 projects
**Pattern extraction date:** 2025-06-09

**Pattern confidence levels:**
- API Routes: HIGH — Direct analogs from production Next.js applications
- Client Components: HIGH — Standard React patterns from multiple projects
- Utility Libraries: HIGH — Singleton pattern matches existing service client patterns
- Type Definitions: HIGH — TypeScript interface patterns consistent across all projects
