# 01 — System context

This view shows the writer-facing application and its two runtime integrations. Arrows point from the initiating user or system; the browser application exchanges story data with local storage and sends generation requests to Gemini.

```mermaid
flowchart LR
    writer["Writer"]
    app["Story Bible AI browser app"]
    storage["Browser localStorage"]
    gemini["Google Gemini API"]

    writer -->|"Edits story and requests generation"| app
    app -->|"Loads and saves story and protocol logs"| storage
    app -->|"Prompts and generation requests"| gemini
    gemini -->|"Generated text, JSON, or stream"| app

    classDef actor fill:#e0e7ff,stroke:#4f46e5,color:#111827
    classDef application fill:#dbeafe,stroke:#2563eb,color:#111827
    classDef persistence fill:#dcfce7,stroke:#16a34a,color:#111827
    classDef external fill:#ffedd5,stroke:#ea580c,color:#111827
    class writer actor
    class app application
    class storage persistence
    class gemini external
```

**Evidence:** The UI is mounted by `index.tsx` and `App.tsx`; story and protocol data use browser `localStorage`; `services/geminiService.ts` uses `@google/genai` to call Gemini. No server-side intermediary appears in the source.
