# 04 — Layered architecture

This view groups modules by their primary responsibility, not by runtime process. Arrows show the principal calls and imports across the UI, application, domain, and integration layers; the app currently combines UI composition and orchestration in `App.tsx`.

```mermaid
flowchart TB
    subgraph presentation["Presentation"]
        app["App.tsx"]
        componentSet["components/FlowCard.tsx, CharacterCard.tsx, WorldbuildingCard.tsx, OutlineItem.tsx, Toast.tsx, NarrativeEngineCard.tsx, icons.tsx"]
        app --> componentSet
    end
    subgraph application["Application state and orchestration"]
        history["hooks/useHistory.ts"]
    end
    subgraph domain["Domain"]
        genre["services/genreData.ts"]
        engine["services/narrativeExploitProtocol.ts"]
        types["types.ts"]
    end
    subgraph integration["Integration and persistence"]
        gemini["services/geminiService.ts"]
        browserStorage["Browser localStorage"]
        api["Google Gemini API"]
    end

    app --> history
    app --> genre
    app --> gemini
    app --> types
    app --> browserStorage
    componentSet --> engine
    componentSet --> gemini
    engine --> types
    genre --> types
    gemini --> engine
    gemini --> types
    gemini --> api

    classDef presentationLayer fill:#dbeafe,stroke:#2563eb,color:#111827
    classDef applicationLayer fill:#ede9fe,stroke:#7c3aed,color:#111827
    classDef domainLayer fill:#dcfce7,stroke:#16a34a,color:#111827
    classDef integrationLayer fill:#ffedd5,stroke:#ea580c,color:#111827
    class app,componentSet presentationLayer
    class history applicationLayer
    class genre,engine,types domainLayer
    class gemini,browserStorage,api integrationLayer
```

**Layer notes:** The UI components render and collect user input. `App.tsx` owns the story workflow and calls both domain and integration modules. The history hook manages undo/redo state; genre data and the protocol hold narrative-specific logic. The Gemini service translates generation tasks into SDK requests, while `localStorage` is accessed directly by the app and narrative engine card rather than through a dedicated persistence module.
