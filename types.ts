
export interface Trait {
    name: string;
    value: string;
}

export interface Character {
    id: string;
    name: string;
    role: string;
    traits: Trait[];
}

export interface WorldbuildingElement {
    id: string;
    name: string;
    type: 'Setting' | 'Item' | 'Lore' | 'Magic System' | 'Creature' | 'Custom';
    traits: Trait[];
}

export interface OutlineChapter {
    id: string;
    title: string;
    summary: string;
}

export interface Beat {
    id: string;
    description: string;
}

export interface StoryData {
    braindump: string;
    genre: string;
    style: string;
    synopsis: string;
    characters: Character[];
    worldbuilding: WorldbuildingElement[];
    outline: OutlineChapter[];
}

// --- Advanced Specs ---

export interface GenreTactic {
    id: string;
    name: string;
    description: string;
    type: 'hijack' | 'paradox' | 'trojan' | 'collapse' | 'inversion';
    targetSection: 'synopsis' | 'characters' | 'worldbuilding' | 'outline';
    dissonanceScore: number;
    genreAlignment: number; // 0-1
}

export interface GenreAxiom {
    id: string;
    statement: string;
    criticality: 'essential' | 'common' | 'optional';
}

export interface GenreModule {
    id: string;
    name: string;
    description: string;
    coreAxioms: GenreAxiom[];
    tactics: GenreTactic[];
}

// --- Narrative Graph & Protocol Types ---

export interface NarrativeGraph {
    essentialNodes: EssentialNode[];
    causalLinks: CausalLink[];
    axioms: GenreAxiom[];
    scenes: any[]; // Simplified scene representation
    coherenceScore?: number;
    dissonanceScore?: number;
    perturbationsApplied?: string[];
}

export interface EssentialNode {
    id: string;
    type: string;
    description: string;
    relatedAxioms?: string[];
    dependentScenes?: string[];
}

export interface CausalLink {
    id: string;
    from: string; // Scene ID
    to: string; // Scene ID
    strength: number;
}

// --- New Protocol Types ---

export interface NarrativeFragment {
    id: string;
    type: string; // Hook, Scene, Logline, Mechanic
    nodeProvenance: string;
    content: string;
    deploymentNote: string;
}

export interface AxiomRelation {
    pair: [string, string];
    relation: 'Independent' | 'Dependent' | 'Contradictory' | 'Unclear';
    description: string;
}

// --- Thematic Analysis Types ---

export interface BeatRelationship {
    sourceBeat: string;
    targetBeat: string;
    relationship: string;
}

export interface SceneConcept {
    title: string;
    purpose: string;
    setting: string;
    characters: string;
    advancement: string;
    content: string;
}

export interface ThematicAnalysisResult {
    coreTheme: string;
    beatRelationships: BeatRelationship[];
    sceneConcepts: SceneConcept[];
}
