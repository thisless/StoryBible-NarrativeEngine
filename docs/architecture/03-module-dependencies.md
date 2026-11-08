# 03 — Module dependencies

This file-level import map groups the main source modules by responsibility. An arrow means the source module imports or directly depends on the target; grouped component nodes list the concrete files represented.

```mermaid
flowchart LR
    subgraph appLayer["Application"]
        entry["index.tsx"]
        app["App.tsx"]
        history["hooks/useHistory.ts"]
    end
    subgraph uiLayer["UI components"]
        cards["components/FlowCard.tsx, CharacterCard.tsx, WorldbuildingCard.tsx, OutlineItem.tsx"]
        engineCard["components/NarrativeEngineCard.tsx"]
        toast["components/Toast.tsx"]
        icons["components/icons.tsx"]
    end
    subgraph domainLayer["Domain and data"]
        genres["services/genreData.ts"]
        protocol["services/narrativeExploitProtocol.ts"]
        types["types.ts"]
    end
    subgraph integrationLayer["Model integration"]
        gemini["services/geminiService.ts"]
        api["Google Gemini API"]
    end

    entry --> app
    app --> history
    app --> cards
    app --> engineCard
    app --> toast
    app --> icons
    app --> genres
    app --> gemini
    app --> types
    cards --> icons
    cards --> types
    engineCard --> protocol
    engineCard --> gemini
    engineCard --> icons
    engineCard --> types
    history --> types
    genres --> types
    protocol --> types
    gemini --> protocol
    gemini --> types
    gemini --> api

    classDef application fill:#dbeafe,stroke:#2563eb,color:#111827
    classDef ui fill:#ede9fe,stroke:#7c3aed,color:#111827
    classDef domain fill:#dcfce7,stroke:#16a34a,color:#111827
    classDef integration fill:#ffedd5,stroke:#ea580c,color:#111827
    class entry,app,history application
    class cards,engineCard,toast,icons ui
    class genres,protocol,types domain
    class gemini,api integration
```

**Notes:** `services/geminiService.ts` imports the protocol's provider types and implements `exploitLLMProvider`; `NarrativeEngineCard.tsx` constructs the protocol engine with that provider. No cycle appears in these imports. `components/StoryBibleSection.tsx` is empty and is not included as an active module.
