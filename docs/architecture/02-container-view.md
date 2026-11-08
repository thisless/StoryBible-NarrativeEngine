# 02 — Container view

This view separates the executable browser experience from browser-provided storage and the external model API. The Vite development server/build tool is a development/build-time tool, not a separately evidenced production service.

```mermaid
flowchart LR
    subgraph client["User device"]
        ui["React and TypeScript SPA"]
        local["Browser localStorage"]
        ui -->|"Story data and protocol logs"| local
    end
    model["Google Gemini API"]
    author["Writer"]

    author -->|"Uses"| ui
    ui -->|"HTTPS model requests via @google/genai"| model
    model -->|"Text, structured output, or stream"| ui

    classDef clientLayer fill:#dbeafe,stroke:#2563eb,color:#111827
    classDef browserLayer fill:#dcfce7,stroke:#16a34a,color:#111827
    classDef externalLayer fill:#ffedd5,stroke:#ea580c,color:#111827
    class ui clientLayer
    class local browserLayer
    class model,author externalLayer
```

**Evidence:** `index.html` loads the frontend entry point; `package.json` defines Vite scripts; `vite.config.ts` configures the Vite server and build-time environment mapping. Gemini SDK calls and browser storage access are in frontend TypeScript modules. The repository contains no backend service or production deployment manifest.
