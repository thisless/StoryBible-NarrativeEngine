# 05 — Primary flow

This sequence follows a writer from initial story input through outline and chapter prose. Solid arrows are calls or writes; dashed arrows represent returned data. Story changes are saved asynchronously to browser storage; model generation uses Gemini directly from the frontend.

```mermaid
sequenceDiagram
    actor Writer
    participant UI as App.tsx
    participant Store as Browser localStorage
    participant AI as services/geminiService.ts
    participant Gemini as Google Gemini API

    Writer->>UI: Enter genre and braindump
    UI->>Store: Save storyBibleData after state change
    Writer->>UI: Generate synopsis
    UI->>AI: generateSynopsis(braindump, genre)
    AI->>Gemini: generateContent(prompt)
    Gemini-->>AI: Synopsis text
    AI-->>UI: Synopsis
    UI->>Store: Save updated storyBibleData
    Writer->>UI: Generate characters, world, and outline
    UI->>AI: Structured generation requests
    AI->>Gemini: generateContent with response schemas
    Gemini-->>AI: JSON content
    AI-->>UI: Characters, worldbuilding, outline
    Writer->>UI: Generate beats, then prose
    UI->>AI: generateBeats(chapter, storyData)
    AI->>Gemini: generateContent
    Gemini-->>AI: Beat list
    AI-->>UI: Beats
    UI->>AI: generateProseStream(beats, storyData)
    AI->>Gemini: generateContentStream
    Gemini-->>UI: Streamed prose chunks
```

**Evidence:** These handlers are implemented in `App.tsx`; model requests and JSON/stream behavior are implemented in `services/geminiService.ts`. The app's save effect writes `storyBibleData` to `localStorage` after story state changes.
