
import { GenreModule } from '../types';

export const GENRE_MODULES: Record<string, GenreModule> = {
    Mystery: {
        id: "genre_mystery",
        name: "Mystery",
        description: "Detective fiction, whodunits, puzzle narratives",
        coreAxioms: [
            { id: "mystery_hidden", statement: "The solution is hidden but discoverable", criticality: "essential" },
            { id: "mystery_detective", statement: "The protagonist actively investigates", criticality: "essential" }
        ],
        tactics: [
            {
                id: "tactic_mystery_hidden_culprit",
                name: "Hidden Culprit Reveal",
                type: "hijack",
                targetSection: "characters",
                description: "Reveal that a trusted ally or the protagonist is the culprit.",
                dissonanceScore: 0.8,
                genreAlignment: 0.9
            },
            {
                id: "tactic_mystery_false_clue",
                name: "The False Lead",
                type: "trojan",
                targetSection: "outline",
                description: "Plant a sequence of events that logically leads to the wrong suspect.",
                dissonanceScore: 0.6,
                genreAlignment: 0.8
            },
             {
                id: "tactic_mystery_impossible",
                name: "Impossible Crime",
                type: "paradox",
                targetSection: "synopsis",
                description: "Rewrite the inciting incident to appear physically impossible under world rules.",
                dissonanceScore: 0.75,
                genreAlignment: 0.7
            }
        ]
    },
    Romance: {
        id: "genre_romance",
        name: "Romance",
        description: "Love stories, relationships, emotional connection",
        coreAxioms: [
            { id: "romance_central", statement: "Relationship is central to plot", criticality: "essential" },
            { id: "romance_hea", statement: "Positive resolution (HEA/HFN)", criticality: "essential" }
        ],
        tactics: [
            {
                id: "tactic_romance_betrayal",
                name: "Love Interest Betrayal",
                type: "hijack",
                targetSection: "synopsis",
                description: "The love interest is revealed to have been using the protagonist from the start.",
                dissonanceScore: 0.85,
                genreAlignment: 0.2
            },
            {
                id: "tactic_romance_triangle_paradox",
                name: "Impossible Choice",
                type: "paradox",
                targetSection: "characters",
                description: "Introduce a third character who is the perfect logical match, creating a paradox with the emotional match.",
                dissonanceScore: 0.7,
                genreAlignment: 0.6
            }
        ]
    },
    "Sci-Fi": {
        id: "genre_scifi",
        name: "Science Fiction",
        description: "Future worlds, advanced technology",
        coreAxioms: [
            { id: "scifi_logic", statement: "Technology follows internal logic", criticality: "essential" }
        ],
        tactics: [
            {
                id: "tactic_scifi_tech_failure",
                name: "System Collapse",
                type: "collapse",
                targetSection: "worldbuilding",
                description: "The central technology of the world suddenly ceases to function.",
                dissonanceScore: 0.75,
                genreAlignment: 0.5
            },
            {
                id: "tactic_scifi_time_paradox",
                name: "Causal Loop",
                type: "paradox",
                targetSection: "outline",
                description: "Introduce a plot point where the effect precedes the cause.",
                dissonanceScore: 0.85,
                genreAlignment: 0.6
            }
        ]
    }
};

export const getGenreModule = (genreInput: string): GenreModule | null => {
    // Simple fuzzy match
    const keys = Object.keys(GENRE_MODULES);
    const match = keys.find(k => genreInput.toLowerCase().includes(k.toLowerCase()));
    return match ? GENRE_MODULES[match] : null;
};
