# Kick-off Summary — YC AI Growth Hackathon

Source: [`kick-off.md`](./kick-off.md)

## What this hackathon is about

The kickoff frames the event around **growth engineering**: engineers who write code, run growth
experiments end to end, automate themselves with AI, and own the full growth pipeline. The central
theme is GTM in the age of AI: how companies find customers, understand them, sell to them, and
operate.

Key evaluation phrase from the kickoff:

> Useful. Hard to build. Cool.

Slides are discouraged. A working demo should speak for itself.

## Schedule

- **Kickoff:** Saturday 6:30pm
- **Hacking starts:** Saturday 7:30pm
- **Dinner:** Saturday 7:30pm
- **Overnight hacking:** allowed in the office
- **Sunday:** breakfast + lunch
- **Project deadline:** Sunday 4:00pm
- **Finalists announced:** Sunday 5:00pm
- **Final pitches:** Sunday 5:00pm
- **Winners announced:** Sunday 6:00pm

## Submission and rules

- Submit via **Vibe Apps** with:
  - open-source GitHub project
  - 3-minute demo video
- Judges review submissions and select finalists for live stage pitches.
- Team size: up to **4 people**.
- You cannot work on projects started before the hackathon.
- Pre-existing projects are allowed only if the hackathon work is a **standalone feature/tool** in a
  separate codebase.
- The project must be open source on GitHub during judging; it can be closed after the hackathon.
- Re-entry is not allowed between **midnight and 6am** if you leave the building.

## Prizes and credits

Main prizes:

- **1st place:** $2,500 cash + $5,000 OpenAI API credits + $500 Cursor credits
- **2nd place:** $1,500 cash + $2,500 OpenAI credits
- **3rd place:** $500 cash + $1,000 OpenAI credits

Sponsor credits/support mentioned:

- OpenAI: $50 hackathon credits, plus prize credits
- Cursor: $50 credits via form/QR
- Orange Slice: $50 credits
- Fiber AI: $500 credits
- Convex: free to build during the hackathon

## Sponsor notes

### Orange Slice

Orange Slice is a **go-to-market engineering platform** for building revenue workflows through code.
The speaker describes it as an **agentic spreadsheet**: type what you want to do, such as finding
customers or running ads, and agents write code / execute the work.

Two usage modes:

- Web UI: agentic spreadsheet interface with a prompt box
- Agent package: bundles sales enrichment providers and provides a harness that can turn a sales or
  coding agent into a sales agent

Relevance to our project: best as a **GTM workflow closing beat**. NeuroViral finds the content
signal; Orange Slice turns that signal into an outbound / growth workflow.

### OpenAI / Codex

OpenAI emphasized using Codex to go from idea to shipped product quickly. The message was to build
something new and ambitious, especially around reimagining GTM: finding customers, understanding
them, selling to them, and operating.

Tools mentioned:

- Codex
- OpenAI docs, MCP, and skills
- Cookbooks for orchestrating agents and technical patterns

Relevance to our project: use OpenAI for the chat/decode layer and sponsor-video/Codex demo clip.

### Convex

Convex is positioned as a **backend platform / database platform** and "backend building blocks for
your agents." It works with tools like Codex and Cursor and can quickly generate a working app when
prompted.

Notes:

- Free to build during the hackathon
- Has components, including R2/Cloudflare-related components
- Sponsor prize: best Convex app aligned with the theme gets $1,000; second place gets $500
- Provided a demo app/template

Relevance to our project: optional infrastructure, but not currently core to our PRD.

### Cursor

Cursor presented its newer agent-first development workflow, including:

- Cursor 3 interface
- Agent window
- Automations for repeatable cloud tasks
- Cloud agents
- Composer 2.5
- Cursor SDK

They showed an internal GTM tool example, **Chat GTM**, used to help account executives quickly
understand accounts like Delta Airlines: customer context, product footprint, org chart, and who to
outbound.

Relevance to our project: sponsor-video flex and useful inspiration for making GTM context feel
concrete on stage.

### Lopez

Lopez is an **operational data platform** for RevOps, growth, and executives. It unifies product,
sales, and marketing data on top of databases/warehouses like Databricks.

Main growth-engineering advice:

- Good growth engineering starts with data.
- The highest-leverage signals are often custom, not bought.
- Find niche signals that are highly relevant to the company.
- Then detect the signal, enrich it, score it, and have an agent act on it.

Suggested stack patterns:

- data ingestion
- Postgres / DuckDB for analytics or read-only querying
- trigger.dev
- Mastra
- Vercel AI SDK
- Slack, email, or web app as the interface

Relevance to our project: this strongly supports our narrative. EEG interest response is our
custom, high-leverage signal.

### Fiber AI

Fiber AI is a sales enrichment / AI agent search provider. It supports real-time scraping and search
across companies and person profiles, with API/MCP docs and free hackathon credits.

Relevance to our project: useful sponsor context, but we replaced the GTM closing beat with Orange
Slice because Orange Slice better matches "turn signal into workflow."

### Corgi

Corgi Cafe sponsored coffee. The organizer also mentioned a possible Q&A with a growth engineer from
the Corgi sales team.

## Strategic takeaways for NeuroViral

1. **Working demo matters more than slides.** The EEG/video/waveform screen needs to carry the pitch.
2. **Usefulness + difficulty + coolness** should be explicit in the story:
   - Useful: reduce UGC spray-and-pray and wasted CAC.
   - Hard: EEG signal capture + waveform/video alignment + content feature extraction.
   - Cool: live brainwave spikes while watching content.
3. **Our custom signal is the point.** Lopez's advice about custom signals maps directly to EEG
   attention/interest data.
4. **Orange Slice is the cleanest sponsor tie-in.** It should be a closing GTM workflow: the content
   signal becomes an outbound workflow.
5. **Sponsor videos should stay as a flex, not the core dataset.** Use 1-2 sponsor launch videos to
   make the room lean in, but keep the main demo narrative around Tech UGC.
6. **No prior-code risk.** Keep the repo as planning/docs until hackathon build time; code should be
   created during the event window.

