# Story Bible AI architecture

Story Bible AI is a browser-based React single-page application for building a story bible and generating narrative material with Google Gemini. The React app keeps story data in browser `localStorage`; there is no application server, database service, or separate API layer in this repository. Vite supplies the development server and production build.

## Diagrams

- [01 — System context](01-system-context.md): the writer, browser app, browser storage, and Gemini.
- [02 — Container view](02-container-view.md): runtime units and the external model integration.
- [03 — Module dependencies](03-module-dependencies.md): source-file imports grouped by layer.
- [04 — Layered architecture](04-layered-architecture.md): UI, application, domain, and integration responsibilities.
- [05 — Primary flow](05-primary-flow.md): story planning, persistence, and prose generation.
- [06 — Directory map](06-directory-map.md): repository layout and folder purposes.

## Technology stack

- **UI:** React 19, TypeScript, JSX, Tailwind CSS via the Tailwind CDN in `index.html`.
- **Build and development:** Vite 6 and `@vitejs/plugin-react`.
- **Generative AI:** `@google/genai`, calling the Gemini API directly from the browser bundle.
- **Persistence:** browser `localStorage`; story state and narrative protocol logs use separate keys.
- **Tests and deployment:** no test scripts, test files, or deployment/infrastructure configuration were found in the repository inventory.

## Confirmed and inferred facts

**Confirmed from source/configuration**

- `index.html` loads `index.tsx`, which mounts `App.tsx` into the `#root` element.
- `App.tsx` orchestrates story editing, calls generation functions, maintains undo/redo history, and saves story data under `storyBibleData`.
- `NarrativeEngineCard.tsx` contains standard genre tactics, a deep protocol flow, and thematic analysis. Protocol logs use `storyBible_protocolLogs`.
- `services/geminiService.ts` instantiates `GoogleGenAI`, uses `gemini-3-flash-preview`, and implements text, structured JSON, and streaming requests.
- `vite.config.ts` reads `GEMINI_API_KEY` and exposes it as `process.env.API_KEY` and `process.env.GEMINI_API_KEY`. The README instructs developers to set `GEMINI_API_KEY` in `.env.local`.
- No `.env.example`, backend, database, cache, queue, or deployment manifest was found in the inspected repository.

**Inferred from configuration and call sites**

- Gemini requests run from the client rather than through a server-side proxy: the SDK is initialized in the frontend module and the key is injected into the frontend build. This means deployment must account for the key's exposure and the API's browser-origin restrictions.
- Users need a network connection and a valid Gemini API key for generated content; manually editing and locally saving story data does not invoke Gemini.
- `NarrativeExploitProtocolEngine` is an experimental client-side workflow. Its caller constructs a mock graph and reads the saved story from `localStorage`, rather than passing live application state into the engine.

## Dependency observations

The source dependency graph has no detected import cycle. `App.tsx` is the primary composition point and has the broadest direct dependency set. `geminiService.ts` is shared by the main app and the narrative engine card; it also implements the LLM-provider interface consumed by the protocol engine. The architecture is a small client-side application, so these are observations rather than measured performance or maintainability findings.

## Scope and limitations

The diagrams describe files and configuration present in this checkout only. No test suite, `.env.example`, CI workflow, or deployment topology was available to verify. The repository README mentions local setup and an AI Studio app, but it does not describe a hosted runtime architecture.
