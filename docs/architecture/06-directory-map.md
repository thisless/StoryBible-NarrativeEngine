# 06 — Directory map

This map gives the repository's working layout and the purpose of each source folder. File groups in a node are literal paths in that directory; build output and dependency directories are omitted.

```mermaid
flowchart TD
    root["Repository root"]
    root --> entry["App.tsx, index.tsx, index.html"]
    root --> models["types.ts"]
    root --> components["components/"]
    components --> widgets["CharacterCard.tsx, FlowCard.tsx, NarrativeEngineCard.tsx, OutlineItem.tsx, StoryBibleSection.tsx, Toast.tsx, WorldbuildingCard.tsx, icons.tsx"]
    root --> hooks["hooks/"]
    hooks --> history["useHistory.ts — undo/redo state"]
    root --> services["services/"]
    services --> serviceFiles["geminiService.ts — Gemini integration; genreData.ts — genre definitions; narrativeExploitProtocol.ts — deep protocol"]
    root --> docs["docs/architecture/"]
    docs --> diagrams["README.md and 01–06 architecture diagrams"]
    root --> config["README.md, package.json, tsconfig.json, vite.config.ts, metadata.json, .gitignore"]

    classDef rootLayer fill:#dbeafe,stroke:#2563eb,color:#111827
    classDef sourceLayer fill:#dcfce7,stroke:#16a34a,color:#111827
    classDef docsLayer fill:#ede9fe,stroke:#7c3aed,color:#111827
    classDef configLayer fill:#ffedd5,stroke:#ea580c,color:#111827
    class root,entry,models rootLayer
    class components,widgets,hooks,history,services,serviceFiles sourceLayer
    class docs,diagrams docsLayer
    class config configLayer
```

**Folder purposes:** `components/` contains React UI components; `hooks/` contains reusable React state logic; `services/` contains Gemini integration and narrative-domain services; `docs/architecture/` contains these architecture notes. Root configuration files define the package scripts, TypeScript settings, Vite setup, and app metadata. `components/StoryBibleSection.tsx` exists but is empty.
