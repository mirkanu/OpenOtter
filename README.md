# OpenOtter

> **Personal project:** This was built to solve a specific problem for the author. It works for that purpose. It has not been tested for general deployment and is not actively maintained — use it as inspiration or a starting point, not a supported tool.

> **100% AI-generated:** No code was written by hand. Every file was produced by [Claude Code](https://claude.ai/claude-code) via the [GSD workflow](https://github.com/open-gsd/gsd-core). The author is a non-programmer building personal tools with AI. PRs are welcome — if one arrives, Claude Code will review and merge it. Issues are unlikely to receive a response.

Otter.ai costs £20/month. This costs pennies. OpenOtter is a mobile-first web app that takes an audio file — from iPhone Voice Memos or any recorder — transcribes it with speaker diarization (who said what), and stores the result as a browsable, searchable transcript with an audio player. The next version will push the transcript and an AI-generated summary directly into Notion and send an email notification when it's done, so you can upload on your phone, pocket it, and find the finished page in Notion a few minutes later.

## Features

- Upload MP3, WAV, or M4A files directly from iPhone (Safari-compatible file picker)
- Speaker diarization — transcript shows who said what, not just a wall of text
- Synchronized audio player — tap any line in the transcript to jump to that moment
- Recordings library with date, duration, and speaker count at a glance
- Dark mode, mobile-first layout, instant skeleton loading states
- Protected by Cloudflare Access — no login screen to build or maintain

## Tip

> **Tip:** Not sure where to start? Paste the link to this page into [Claude](https://claude.ai), [ChatGPT](https://chat.openai.com), or any AI assistant and ask it to walk you through the setup. These tools can read GitHub pages and guide you step by step.

## Quick setup

1. **Clone the repo** and install dependencies:
   ```bash
   git clone https://github.com/mirkanu/OpenOtter.git
   cd OpenOtter
   npm install
   ```

2. **Get API keys:**
   - [AssemblyAI](https://www.assemblyai.com/app) — free tier covers ~3 hours/month
   - [Resend](https://resend.com/api-keys) — 3,000 free emails/month

3. **Create a `.env.local` file** (copy from `.env.local.example`) and fill in your keys:
   ```
   ASSEMBLYAI_API_KEY=your_key_here
   OPENOTTER_RESEND_API_KEY=your_key_here
   NOTIFICATION_EMAIL=you@example.com
   ```

4. **Create upload and database directories:**
   ```bash
   mkdir -p /home/services/openotter/uploads /home/services/openotter/logs
   ```

5. **Run in development:**
   ```bash
   npm run dev
   ```

6. **Deploy to a server** — the app expects PM2 and a local filesystem. Copy `ecosystem.config.js`, update the paths to match your server, and run:
   ```bash
   npm run build
   pm2 start ecosystem.config.js
   ```

7. **Protect with Cloudflare Access** — set up a self-hosted application in the Cloudflare Zero Trust dashboard pointing at your domain. Allows your email address only. No auth code required.

## Roadmap

**v2 — Integrations (next):** Notion OAuth so the app can write to your workspace, AI-generated summaries via Claude, and email notifications (success with a Notion link, failure with error details). The full loop: upload on your phone → Notion page appears a few minutes later with a summary in your inbox.

**Long-term:** The Notion OAuth integration in v2 will be built behind a thin abstraction layer so it can be swapped out for [Nango](https://nango.dev/) — a managed OAuth platform that handles token refresh, provider quirks, and multi-user credential storage. Nango is overkill for a single-user personal tool, but designing v2 with a clean provider interface means adding it later (and with it, support for other services beyond Notion) is a small lift rather than a rewrite.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Transcription | AssemblyAI (speaker diarization built-in) |
| Database | SQLite via better-sqlite3 |
| Email | Resend |
| Hosting | Hetzner VPS + PM2 |
| Tunnel | Cloudflare Tunnel + Access |
