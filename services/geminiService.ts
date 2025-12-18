
import { GoogleGenAI, Type } from "@google/genai";
import { Character, WorldbuildingElement, OutlineChapter, Beat, StoryData, GenreTactic, EssentialNode, GenreAxiom, AxiomRelation, NarrativeFragment, ThematicAnalysisResult } from '../types';
import { LLMProvider, PerturbationType } from './narrativeExploitProtocol';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-3-flash-preview';

// ... (keep existing schemas) ...
const characterSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'Character name' },
        role: { type: Type.STRING, description: 'Role in the story (e.g., Protagonist, Antagonist, Supporting)' },
        traits: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Trait category (e.g., Personality, Background, Physical Description, Dialogue Style)" },
                    value: { type: Type.STRING, description: "Description of the trait" },
                },
                required: ['name', 'value'],
            },
        },
    },
    required: ['name', 'role', 'traits'],
};

const worldbuildingSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'Name of the worldbuilding element' },
        type: { type: Type.STRING, description: 'Type of element (e.g., Setting, Item, Lore, Magic System, Creature)' },
        traits: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Trait category (e.g., Description, History, Purpose)" },
                    value: { type: Type.STRING, description: "Description of the trait" },
                },
                required: ['name', 'value'],
            },
        }
    },
    required: ['name', 'type', 'traits'],
};

const outlineSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'Chapter title (e.g., "Chapter 1: The Discovery")' },
        summary: { type: Type.STRING, description: 'A detailed summary of the events in this chapter.' },
    },
    required: ['title', 'summary'],
};

const beatSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: 'A short description of a key narrative moment or scene (a story beat).' },
    },
    required: ['description'],
};

// --- Thematic Analysis Schemas ---

const beatRelationshipSchema = {
    type: Type.OBJECT,
    properties: {
        sourceBeat: { type: Type.STRING, description: "The earlier beat/event in the outline." },
        targetBeat: { type: Type.STRING, description: "The later beat/event in the outline." },
        relationship: { type: Type.STRING, description: "Description of the cause-and-effect relationship and its thematic relevance." },
    },
    required: ['sourceBeat', 'targetBeat', 'relationship']
};

const sceneConceptSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Suggested title for the scene." },
        purpose: { type: Type.STRING, description: "The narrative purpose of this scene." },
        setting: { type: Type.STRING, description: "Where the scene takes place." },
        characters: { type: Type.STRING, description: "Key characters involved." },
        advancement: { type: Type.STRING, description: "Explanation of how this scene strengthens or explores the core theme." },
        content: { type: Type.STRING, description: "Suggested dialogue snippets or action description (the scene premise)." },
    },
    required: ['title', 'purpose', 'setting', 'characters', 'advancement', 'content']
};

const thematicAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        coreTheme: { type: Type.STRING, description: "The central theme statement including supporting textual evidence." },
        beatRelationships: { type: Type.ARRAY, items: beatRelationshipSchema },
        sceneConcepts: { type: Type.ARRAY, items: sceneConceptSchema },
    },
    required: ['coreTheme', 'beatRelationships', 'sceneConcepts']
};


const cleanJson = (text: string | undefined): string => {
    if (!text) return "[]";
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return cleaned;
};

// ... (keep existing generators) ...
export const generateSynopsis = async (braindump: string, genre: string): Promise<string> => {
    const prompt = `Based on the following braindump and genre, write a compelling and detailed story synopsis. The synopsis should establish the main characters, their goals, the central conflict, how the story begins and ends, and convey the story's tone and themes.

Genre: ${genre}

Braindump:
${braindump}`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    return response.text || "";
};

export const generateCharacters = async (synopsis: string): Promise<Omit<Character, 'id'>[]> => {
    const prompt = `Based on the following synopsis, generate a list of the main characters. For each character, provide their name, role, and detailed traits for Personality, Background, Physical Description, and Dialogue Style.

Synopsis:
${synopsis}`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: characterSchema,
            },
        }
    });
    return JSON.parse(cleanJson(response.text));
};

export const generateWorldbuilding = async (synopsis: string): Promise<Omit<WorldbuildingElement, 'id'>[]> => {
    const prompt = `Based on the following synopsis, generate a list of key worldbuilding elements. These can be important settings, magical items, lore, or unique systems. For each element, provide its name, type, and a detailed description.

Synopsis:
${synopsis}`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: worldbuildingSchema,
            },
        }
    });
    return JSON.parse(cleanJson(response.text));
};

export const generateOutline = async (storyData: StoryData): Promise<Omit<OutlineChapter, 'id'>[]> => {
    const prompt = `Based on the complete story bible provided, generate a multi-chapter story outline. Each chapter should have a title and a detailed summary of events.

Genre: ${storyData.genre}
Style: ${storyData.style}

Synopsis:
${storyData.synopsis}

Characters:
${storyData.characters.map(c => `${c.name} (${c.role})`).join(', ')}

Worldbuilding:
${storyData.worldbuilding.map(w => `${w.name} (${w.type})`).join(', ')}

Generate a logical, well-paced story outline.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: outlineSchema,
            },
        }
    });
    return JSON.parse(cleanJson(response.text));
};

export const generateBeats = async (chapter: OutlineChapter, storyData: StoryData): Promise<Omit<Beat, 'id'>[]> => {
    const prompt = `You are a story editor. Your task is to break down a chapter summary into a sequence of distinct story beats. Each beat should represent a single, focused moment in the story.

Story Context:
Genre: ${storyData.genre}
Synopsis: ${storyData.synopsis}

Chapter to break down:
Title: ${chapter.title}
Summary: ${chapter.summary}

Generate a list of beat descriptions for this chapter.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: beatSchema,
            },
        }
    });
    return JSON.parse(cleanJson(response.text));
};

export const generateProseStream = async (beats: Beat[], storyData: StoryData) => {
    const prompt = `You are a talented author. Write the prose for a chapter based on the provided story bible and story beats. Follow the specified style and genre.

STORY BIBLE:
Genre: ${storyData.genre}
Style: ${storyData.style}
Synopsis: ${storyData.synopsis}
Characters:
${storyData.characters.map(c => `- ${c.name}: ${c.traits.map(t => `${t.name}: ${t.value}`).join('; ')}`).join('\n')}
Worldbuilding:
${storyData.worldbuilding.map(w => `- ${w.name}: ${w.traits.map(t => `${t.name}: ${t.value}`).join('; ')}`).join('\n')}

BEATS FOR THIS CHAPTER:
${beats.map((s, i) => `${i + 1}. ${s.description}`).join('\n')}

Now, write the chapter prose.`;

    const response = await ai.models.generateContentStream({
        model,
        contents: prompt,
    });
    return response;
};

// --- Tactic Application ---
export const applyTactic = async (storyData: StoryData, tactic: GenreTactic): Promise<any> => {
    const isListResponse = tactic.targetSection === 'characters' || tactic.targetSection === 'worldbuilding' || tactic.targetSection === 'outline';
    let schema;
    if (tactic.targetSection === 'characters') schema = { type: Type.ARRAY, items: characterSchema };
    else if (tactic.targetSection === 'worldbuilding') schema = { type: Type.ARRAY, items: worldbuildingSchema };
    else if (tactic.targetSection === 'outline') schema = { type: Type.ARRAY, items: outlineSchema };
    else schema = undefined;

    const context = `
    CURRENT STORY DATA:
    Synopsis: ${storyData.synopsis}
    Characters: ${JSON.stringify(storyData.characters.map(c => ({name: c.name, role: c.role})))}
    Worldbuilding: ${JSON.stringify(storyData.worldbuilding.map(w => ({name: w.name, type: w.type})))}
    Outline: ${JSON.stringify(storyData.outline.map(o => o.title))}
    `;

    const prompt = `
    You are a narrative expert engine. Apply the following NARRATIVE TACTIC to the '${tactic.targetSection}' of the story.
    TACTIC NAME: ${tactic.name}
    TACTIC DESCRIPTION: ${tactic.description}
    TARGET SECTION: ${tactic.targetSection}
    ${context}
    INSTRUCTIONS:
    Rewrite or Regenerate the '${tactic.targetSection}' to incorporate this tactic. 
    Ensure the changes are consistent with the rest of the story but strictly apply the twist/modification described in the tactic.
    Return ONLY the new content for '${tactic.targetSection}'.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: schema ? {
            responseMimeType: 'application/json',
            responseSchema: schema,
        } : undefined
    });

    if (isListResponse) {
        return JSON.parse(cleanJson(response.text));
    } else {
        let text = response.text || "";
        // Basic markdown cleanup if model wraps text in blocks
        text = text.replace(/^```(markdown)?\s*/i, '').replace(/\s*```$/, '');
        return text.trim();
    }
};

// --- Thematic Analysis ---

export const performThematicAnalysis = async (storyData: StoryData): Promise<ThematicAnalysisResult> => {
    const outlineText = storyData.outline.map(ch => `Chapter: ${ch.title}\nSummary: ${ch.summary}`).join('\n\n');
    
    const context = `
    Synopsis: ${storyData.synopsis}
    
    Outline:
    ${outlineText || "No outline generated yet."}
    `;

    const prompt = `
    Act as a literary analyst specializing in narrative structure and thematic development.

    Analyze the provided story text to assess its thematic coherence.

    1. Identify the Core Theme:
       - Clearly state the central theme that underpins the narrative.
       - Provide textual evidence or examples to support your identification.

    2. Visualize Beat Relationships:
       - Map out the key plot points (beats) of the story.
       - Illustrate how these beats connect and contribute to the development of the core theme. Focus on the relationship and its thematic relevance.

    3. Generate New Scene Concepts:
       - Propose 3-5 distinct new scene concepts.
       - Each concept should be designed to further strengthen or explore the identified core theme.
       - For each concept, briefly explain how it enhances thematic coherence.
       - Present these concepts concisely, focusing on the scene's premise and its thematic contribution.

    NARRATIVE INPUT:
    ${context}
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: thematicAnalysisSchema,
        }
    });
    return JSON.parse(cleanJson(response.text));
};


// --- LLM Provider Implementation for Exploit Protocol ---

export const exploitLLMProvider: LLMProvider = {
    clusterBySemanticSimilarity: async (texts: string[], numClusters: number): Promise<number[][]> => {
        // Simplified grouping for demo: just chunks the array
        const result: number[][] = [];
        const chunkSize = Math.ceil(texts.length / numClusters);
        for (let i = 0; i < texts.length; i += chunkSize) {
            const chunk = [];
            for (let j = 0; j < chunkSize && i + j < texts.length; j++) {
                chunk.push(i + j);
            }
            result.push(chunk);
        }
        return result;
    },

    atomizeAxiom: async (statement: string, inverted: string) => {
        const prompt = `Break down the following narrative statement into minimal atomic facts (axioms).
        Statement: "${statement}"
        Return a JSON array of objects with 'text' (the atomic fact) and 'confidence' (0-1) and 'implications' (array of strings).`;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            confidence: { type: Type.NUMBER },
                            implications: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['text', 'confidence', 'implications']
                    }
                }
            }
        });
        return JSON.parse(cleanJson(response.text));
    },

    atomizeNode: async (node: any) => {
        return exploitLLMProvider.atomizeAxiom(node.description || node.statement || "No description", "");
    },

    suggestPerturbations: async (atomStatement: string, implications: string[], tacticRules: any) => {
        const prompt = `Suggest narrative perturbations (exploits) for the following atomic truth:
        Truth: "${atomStatement}"
        Implications: ${implications.join(', ')}
        
        Available Tactics: Invert, Neutralize, Trojan, Corrupt, Paradox.
        Suggest 2 specific perturbations.
        Return JSON array.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            method: { type: Type.STRING },
                            predictedDissonance: { type: Type.NUMBER },
                            predictedCoherenceDelta: { type: Type.NUMBER },
                            suggestedIntensity: { type: Type.NUMBER }
                        },
                        required: ['type', 'method', 'predictedDissonance', 'predictedCoherenceDelta', 'suggestedIntensity']
                    }
                }
            }
        });
        
        const raw = JSON.parse(cleanJson(response.text));
        return raw.map((r: any) => ({
            ...r,
            type: r.type.toLowerCase() as PerturbationType,
            estimatedTokens: 150,
            estimatedDurationMs: 800,
            preconditions: []
        }));
    },

    simulatePerturbation: async (method: string, variantContent: string, graph: any, intensity: number) => {
        return {
            affectedSceneIds: [],
            affectedNodeIds: [],
            predictedCoherenceDelta: -0.2 * intensity,
            predictedDissonanceDelta: 0.3 * intensity
        };
    },

    // --- New Protocol Methods ---

    extractAxioms: async (content: string): Promise<GenreAxiom[]> => {
        const prompt = `
        NARRATIVE EXPLOIT PROTOCOL: STEP 1 - AXIOM EXTRACTION
        
        Analyze the following story content and extract 6-10 core axioms.
        Axioms are immutable principles or facts that the story assumes.
        Format: Simple, declarative statements using "is/has/does".
        Tag each as 'Explicit' (stated) or 'Inferred' (logical necessity).

        CONTENT:
        ${content}
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            statement: { type: Type.STRING },
                            criticality: { type: Type.STRING, enum: ['essential', 'common', 'optional'] }
                        },
                        required: ['statement', 'criticality']
                    }
                }
            }
        });
        return JSON.parse(cleanJson(response.text)).map((a:any) => ({...a, id: self.crypto.randomUUID()}));
    },

    analyzeConsistency: async (axioms: GenreAxiom[]): Promise<AxiomRelation[]> => {
        const statements = axioms.map(a => `ID ${a.id}: ${a.statement}`).join('\n');
        const prompt = `
        NARRATIVE EXPLOIT PROTOCOL: STEP 2 - CONSISTENCY ANALYSIS

        Analyze the logic between these narrative axioms.
        For relevant pairs, determine if they are:
        - Independent
        - Dependent (One requires the other)
        - Contradictory (Cannot both be true)
        
        AXIOMS:
        ${statements}
        
        Return a list of significant relations.
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            pair: { type: Type.ARRAY, items: { type: Type.STRING } },
                            relation: { type: Type.STRING, enum: ['Independent', 'Dependent', 'Contradictory', 'Unclear'] },
                            description: { type: Type.STRING }
                        },
                        required: ['pair', 'relation', 'description']
                    }
                }
            }
        });
        return JSON.parse(cleanJson(response.text));
    },

    reduceKernel: async (axioms: GenreAxiom[], analysis: AxiomRelation[]): Promise<GenreAxiom[]> => {
        const prompt = `
        NARRATIVE EXPLOIT PROTOCOL: STEP 3 - REDUCTION

        Compress these axioms into an essential, conflict-free kernel (max 6 axioms).
        Rules:
        1. Subsume implied axioms.
        2. Merge similar axioms.
        3. Isolate/Resolve contradictions.

        AXIOMS:
        ${axioms.map(a => a.statement).join('\n')}

        ANALYSIS:
        ${analysis.map(r => `${r.relation}: ${r.description}`).join('\n')}
        `;

         const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            statement: { type: Type.STRING },
                            criticality: { type: Type.STRING, enum: ['essential'] }
                        },
                        required: ['statement']
                    }
                }
            }
        });
        return JSON.parse(cleanJson(response.text)).map((a:any) => ({...a, id: self.crypto.randomUUID()}));
    },

    generateNodes: async (kernel: GenreAxiom[]): Promise<EssentialNode[]> => {
        const prompt = `
        NARRATIVE EXPLOIT PROTOCOL: STEP 4 - NODE GENERATION

        Convert the Reduced Kernel axioms into manipulable narrative nodes (Objects, Characters, Locations, or Laws).
        Add 1 Wildcard Node (volatile element).

        KERNEL:
        ${kernel.map(a => a.statement).join('\n')}
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            description: { type: Type.STRING }, // Role
                            relatedAxioms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hook" },
                        },
                        required: ['type', 'description', 'relatedAxioms']
                    }
                }
            }
        });
        return JSON.parse(cleanJson(response.text)).map((n:any) => ({
            id: self.crypto.randomUUID(),
            type: n.type,
            description: n.description,
            relatedAxioms: n.relatedAxioms // Using this field for the Hook in this implementation
        }));
    },

    generateFragments: async (nodes: EssentialNode[], style: string): Promise<NarrativeFragment[]> => {
        const prompt = `
        NARRATIVE EXPLOIT PROTOCOL: STEP 5 & 6 - EXPLOITATION & FRAGMENTS

        Act as a creative AI assistant specializing in narrative structure and thematic development.
        
        Use the following nodes to generate high-leverage narrative fragments (Hooks, Scenes, Mechanics, Loglines).
        Apply the style: ${style}.
        
        NODES:
        ${nodes.map(n => `${n.type}: ${n.description} (Hook: ${n.relatedAxioms?.join(' ')})`).join('\n')}

        Generate 6 distinct fragments.
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            content: { type: Type.STRING },
                            deploymentNote: { type: Type.STRING },
                            nodeProvenance: { type: Type.STRING }
                        },
                        required: ['type', 'content', 'deploymentNote', 'nodeProvenance']
                    }
                }
            }
        });
        return JSON.parse(cleanJson(response.text)).map((f:any) => ({...f, id: self.crypto.randomUUID()}));
    }
};
