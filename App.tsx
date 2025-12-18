
import React, { useState, useCallback, useEffect } from 'react';
import { Character, WorldbuildingElement, OutlineChapter, Beat, StoryData, GenreTactic } from './types';
import * as geminiService from './services/geminiService';
import { GENRE_MODULES, getGenreModule } from './services/genreData';
import { useHistory } from './hooks/useHistory';

import { FlowCard } from './components/FlowCard';
import { CharacterCard } from './components/CharacterCard';
import { WorldbuildingCard } from './components/WorldbuildingCard';
import { OutlineItem } from './components/OutlineItem';
import { ToastContainer, ToastMessage } from './components/Toast';
import { NarrativeEngineCard } from './components/NarrativeEngineCard';

import { 
    BrainIcon, BookOpenIcon, SparklesIcon,
    GlobeAltIcon, ListBulletIcon, StoryBibleIcon, GenreIcon, StyleIcon, CharacterIcon
} from './components/icons';

const App: React.FC = () => {
    // History Hook manages the StoryData state now
    const { 
        state: storyData, 
        set: setStoryData, 
        init: initStoryData,
        undo, 
        redo, 
        canUndo, 
        canRedo,
        historyDepth
    } = useHistory({
        braindump: '',
        genre: '',
        style: '',
        synopsis: '',
        characters: [],
        worldbuilding: [],
        outline: [],
    });

    const [beats, setBeats] = useState<Beat[]>([]);
    const [draftProse, setDraftProse] = useState<string>('');
    const [activeChapterForGeneration, setActiveChapterForGeneration] = useState<OutlineChapter | null>(null);

    const [loadingStates, setLoadingStates] = useState({
        synopsis: false,
        characters: false,
        worldbuilding: false,
        outline: false,
        beats: false,
        prose: false,
        tactic: false
    });

    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isStorageAvailable, setIsStorageAvailable] = useState(true);

    const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // 1. Check Storage Availability & Load Data on Mount
    useEffect(() => {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            setIsStorageAvailable(true);
        } catch (e) {
            setIsStorageAvailable(false);
            addToast("Local storage is unavailable. Your progress will not be saved.", 'error');
            setIsLoaded(true);
            return;
        }

        try {
            const savedData = localStorage.getItem('storyBibleData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                initStoryData(parsedData);
                addToast("Story loaded successfully.", 'success');
            }
        } catch (error) {
            console.error("Failed to parse local storage data:", error);
            addToast("Failed to load saved story. Data might be corrupted.", 'error');
        } finally {
            setIsLoaded(true);
        }
    }, [addToast, initStoryData]);

    // 2. Save Data on Change
    useEffect(() => {
        if (!isLoaded || !isStorageAvailable) return;

        const saveData = async () => {
            try {
                localStorage.setItem('storyBibleData', JSON.stringify(storyData));
            } catch (error) {
                console.error("Save failed:", error);
                addToast("Failed to save story progress.", 'error');
            }
        };

        const timeoutId = setTimeout(saveData, 500);
        return () => clearTimeout(timeoutId);

    }, [storyData, isLoaded, isStorageAvailable, addToast]);

    const updateStoryData = <K extends keyof StoryData>(key: K, value: StoryData[K]) => {
        setStoryData({ ...storyData, [key]: value });
    };

    // --- Generator Handlers ---

    const handleGenerateSynopsis = useCallback(async () => {
        setLoadingStates(prev => ({ ...prev, synopsis: true }));
        try {
            const result = await geminiService.generateSynopsis(storyData.braindump, storyData.genre);
            updateStoryData('synopsis', result);
            addToast('Synopsis generated!', 'success');
        } catch (error) {
            console.error("Failed to generate synopsis:", error);
            addToast("Error generating synopsis.", 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, synopsis: false }));
        }
    }, [storyData.braindump, storyData.genre, addToast, storyData]); // Added storyData dependency

    const handleGenerateCharacters = useCallback(async () => {
        setLoadingStates(prev => ({ ...prev, characters: true }));
        try {
            const result = await geminiService.generateCharacters(storyData.synopsis);
            updateStoryData('characters', result.map(c => ({...c, id: self.crypto.randomUUID()})));
            addToast('Characters generated!', 'success');
        } catch (error) {
            console.error("Failed to generate characters:", error);
            addToast("Error generating characters.", 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, characters: false }));
        }
    }, [storyData.synopsis, addToast, storyData]);

    const handleGenerateWorldbuilding = useCallback(async () => {
        setLoadingStates(prev => ({ ...prev, worldbuilding: true }));
        try {
            const results = await geminiService.generateWorldbuilding(storyData.synopsis);
            updateStoryData('worldbuilding', results.map(w => ({ ...w, id: self.crypto.randomUUID() })));
            addToast('Worldbuilding generated!', 'success');
        } catch (error) {
            console.error("Failed to generate worldbuilding:", error);
            addToast("Error generating worldbuilding.", 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, worldbuilding: false }));
        }
    }, [storyData.synopsis, addToast, storyData]);

    const handleGenerateOutline = useCallback(async () => {
        setLoadingStates(prev => ({ ...prev, outline: true }));
        try {
            const result = await geminiService.generateOutline(storyData);
            updateStoryData('outline', result.map(o => ({...o, id: self.crypto.randomUUID()})));
            addToast('Outline generated!', 'success');
        } catch (error) {
            console.error("Failed to generate outline:", error);
            addToast("Error generating outline.", 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, outline: false }));
        }
    }, [storyData, addToast]);

    const handleGenerateBeats = useCallback(async (chapter: OutlineChapter) => {
        setActiveChapterForGeneration(chapter);
        setLoadingStates(prev => ({ ...prev, beats: true }));
        setBeats([]);
        setDraftProse('');
        try {
            const results = await geminiService.generateBeats(chapter, storyData);
            setBeats(results.map(s => ({...s, id: self.crypto.randomUUID()})));
        } catch (error) {
            console.error("Failed to generate beats:", error);
             addToast("Error generating beats.", 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, beats: false }));
        }
    }, [storyData, addToast]);

    const handleGenerateProse = useCallback(async () => {
        if (!activeChapterForGeneration || beats.length === 0) return;
        setLoadingStates(prev => ({ ...prev, prose: true }));
        setDraftProse('');
        try {
            const stream = await geminiService.generateProseStream(beats, storyData);
            for await (const chunk of stream) {
                setDraftProse(prev => prev + chunk.text);
            }
            addToast('Prose generation complete.', 'success');
        } catch (error) {
            console.error("Failed to generate prose:", error);
            addToast("Error generating prose.", 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, prose: false }));
        }
    }, [activeChapterForGeneration, beats, storyData, addToast]);

    // --- Tactic Handler ---

    const handleApplyTactic = useCallback(async (tactic: GenreTactic) => {
        setLoadingStates(prev => ({ ...prev, tactic: true }));
        try {
            // Apply tactic using Gemini
            const result = await geminiService.applyTactic(storyData, tactic);
            
            // Map result to correct state key and process structure
            if (tactic.targetSection === 'characters') {
                updateStoryData('characters', result.map((c: any) => ({...c, id: self.crypto.randomUUID()})));
            } else if (tactic.targetSection === 'worldbuilding') {
                updateStoryData('worldbuilding', result.map((w: any) => ({...w, id: self.crypto.randomUUID()})));
            } else if (tactic.targetSection === 'outline') {
                updateStoryData('outline', result.map((o: any) => ({...o, id: self.crypto.randomUUID()})));
            } else {
                updateStoryData('synopsis', result);
            }
            
            addToast(`Applied Tactic: ${tactic.name}`, 'success');
        } catch (error) {
            console.error("Failed to apply tactic:", error);
            addToast("Failed to apply narrative tactic.", 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, tactic: false }));
        }
    }, [storyData, addToast]); // updateStoryData is stable from useHistory

    // --- CRUD Helpers ---

    const addCharacter = () => {
        const newChar: Character = {
            id: self.crypto.randomUUID(),
            name: 'New Character',
            role: 'Supporting',
            traits: [
                { name: 'Personality', value: '' },
                { name: 'Background', value: '' },
                { name: 'Physical Description', value: '' },
                { name: 'Dialogue Style', value: '' },
            ]
        };
        updateStoryData('characters', [...storyData.characters, newChar]);
    };

    const updateCharacter = (updatedChar: Character) => {
        updateStoryData('characters', storyData.characters.map(c => c.id === updatedChar.id ? updatedChar : c));
    };

    const deleteCharacter = (id: string) => {
        updateStoryData('characters', storyData.characters.filter(c => c.id !== id));
    };
    
    const addWorldbuildingElement = () => {
        const newElement: WorldbuildingElement = {
            id: self.crypto.randomUUID(),
            name: 'New Element',
            type: 'Setting',
            traits: [{ name: 'Description', value: '' }]
        };
        updateStoryData('worldbuilding', [...storyData.worldbuilding, newElement]);
    };

    const updateWorldbuildingElement = (updatedElement: WorldbuildingElement) => {
        updateStoryData('worldbuilding', storyData.worldbuilding.map(w => w.id === updatedElement.id ? updatedElement : w));
    };

    const deleteWorldbuildingElement = (id: string) => {
        updateStoryData('worldbuilding', storyData.worldbuilding.filter(w => w.id !== id));
    };
    
    const updateOutlineChapter = (updatedChapter: OutlineChapter) => {
        updateStoryData('outline', storyData.outline.map(o => o.id === updatedChapter.id ? updatedChapter : o));
    };

    const copyProseToClipboard = () => {
        navigator.clipboard.writeText(draftProse);
        addToast("Copied to clipboard!", 'info');
    };

    const genreModule = getGenreModule(storyData.genre);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-32">
                <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <StoryBibleIcon className="h-8 w-8 text-indigo-500" />
                            <h1 className="text-3xl font-bold tracking-tight text-white">Story Bible</h1>
                        </div>
                        <p className="text-slate-400 max-w-2xl text-sm md:text-base">
                            An AI-powered creative suite for storytellers. Plan your world, develop characters, and generate prose.
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex space-x-2 bg-slate-900 rounded-lg p-1 border border-slate-800">
                             <button 
                                onClick={undo} 
                                disabled={!canUndo}
                                className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
                                title="Undo"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <span className="text-xs text-slate-600 self-center font-mono">
                                v{historyDepth + 1}
                            </span>
                            <button 
                                onClick={redo} 
                                disabled={!canRedo}
                                className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
                                title="Redo"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Section 1: Foundation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FlowCard title="Genre" icon={<GenreIcon className="w-5 h-5"/>} color="indigo" className="h-full">
                        <div className="h-full flex flex-col justify-center">
                            <input
                                list="genres"
                                type="text"
                                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-white placeholder-slate-600"
                                placeholder="e.g., Epic Fantasy"
                                value={storyData.genre}
                                onChange={(e) => updateStoryData('genre', e.target.value)}
                            />
                            <datalist id="genres">
                                <option value="Fantasy" />
                                <option value="Sci-Fi" />
                                <option value="Mystery" />
                                <option value="Romance" />
                                <option value="Thriller" />
                                <option value="Historical Fiction" />
                                <option value="Contemporary" />
                            </datalist>
                        </div>
                    </FlowCard>
                    <FlowCard title="Style" icon={<StyleIcon className="w-5 h-5"/>} color="indigo" className="h-full">
                        <div className="h-full flex flex-col justify-center">
                            <input
                                type="text"
                                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-white placeholder-slate-600"
                                placeholder="e.g., Fast-paced, Atmospheric, Humorous"
                                value={storyData.style}
                                onChange={(e) => updateStoryData('style', e.target.value)}
                            />
                        </div>
                    </FlowCard>
                </div>

                {/* Narrative Engine (Advanced Features) */}
                {storyData.genre && (
                    <NarrativeEngineCard 
                        genreModule={genreModule} 
                        currentGenre={storyData.genre}
                        onApplyTactic={handleApplyTactic}
                        isProcessing={loadingStates.tactic}
                    />
                )}

                {/* Section 2: Brainstorming */}
                <FlowCard title="Braindump" icon={<BrainIcon className="w-5 h-5"/>} color="slate">
                    <textarea
                        className="w-full h-48 p-4 bg-slate-900 border border-slate-700 rounded-lg resize-y focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-300 leading-relaxed"
                        placeholder="Pour your raw ideas here. Don't worry about structure yet..."
                        value={storyData.braindump}
                        onChange={(e) => updateStoryData('braindump', e.target.value)}
                    />
                </FlowCard>

                {/* Section 3: Core Story */}
                <FlowCard 
                    title="Synopsis" 
                    icon={<BookOpenIcon className="w-5 h-5"/>} 
                    color="orange"
                    onGenerate={handleGenerateSynopsis}
                    isLoading={loadingStates.synopsis}
                    generateLabel="Generate Synopsis"
                    generateDisabled={!storyData.braindump || !storyData.genre}
                    generateTooltip="Generates a story synopsis based on selected genres and themes."
                >
                     <textarea
                        className="w-full h-64 p-4 bg-slate-900 border border-slate-700 rounded-lg resize-y focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-300 leading-relaxed"
                        placeholder="The core story arc. Auto-generate from your braindump, or write it yourself."
                        value={storyData.synopsis}
                        onChange={(e) => updateStoryData('synopsis', e.target.value)}
                    />
                </FlowCard>

                {/* Section 4: World & Characters */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FlowCard 
                        title="Characters" 
                        icon={<CharacterIcon className="w-5 h-5"/>} 
                        color="green"
                        onGenerate={handleGenerateCharacters}
                        isLoading={loadingStates.characters}
                        generateLabel="Generate Cast"
                        generateDisabled={!storyData.synopsis}
                        generateTooltip="Generates character profiles relevant to the story genre and plot."
                        className="h-[650px]"
                    >
                         <div className="flex flex-col h-full">
                            <div className="space-y-4 flex-grow overflow-y-auto pr-2 pb-4">
                                {storyData.characters.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 border-2 border-dashed border-slate-800/50 rounded-lg bg-slate-900/30 mx-1">
                                        <CharacterIcon className="w-12 h-12 opacity-20" />
                                        <p className="text-center italic px-8 max-w-xs leading-relaxed">
                                            No characters created yet! Click "Generate" or add your own to bring your story to life.
                                        </p>
                                    </div>
                                )}
                                {storyData.characters.map(char => (
                                    <CharacterCard key={char.id} character={char} onUpdate={updateCharacter} onDelete={deleteCharacter} />
                                ))}
                            </div>
                            <button onClick={addCharacter} className="mt-4 w-full py-3 border-2 border-dashed border-slate-700 rounded-lg hover:bg-slate-800 hover:border-indigo-500 transition text-slate-400 font-medium">
                                + Add Character
                            </button>
                        </div>
                    </FlowCard>
                    <FlowCard 
                        title="Worldbuilding" 
                        icon={<GlobeAltIcon className="w-5 h-5"/>} 
                        color="cyan"
                        onGenerate={handleGenerateWorldbuilding}
                        isLoading={loadingStates.worldbuilding}
                        generateLabel="Generate World"
                        generateDisabled={!storyData.synopsis}
                        generateTooltip="Generates detailed worldbuilding elements consistent with the story's genre."
                        className="h-[650px]"
                    >
                        <div className="flex flex-col h-full">
                            <div className="space-y-4 flex-grow overflow-y-auto pr-2 pb-4">
                                {storyData.worldbuilding.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 border-2 border-dashed border-slate-800/50 rounded-lg bg-slate-900/30 mx-1">
                                        <GlobeAltIcon className="w-12 h-12 opacity-20" />
                                        <p className="text-center italic px-8 max-w-xs leading-relaxed">
                                            Start building your world! Click "Generate" or manually add details to define your story's setting.
                                        </p>
                                    </div>
                                )}
                                {storyData.worldbuilding.map(element => (
                                    <WorldbuildingCard key={element.id} element={element} onUpdate={updateWorldbuildingElement} onDelete={deleteWorldbuildingElement} />
                                ))}
                            </div>
                             <button onClick={addWorldbuildingElement} className="mt-4 w-full py-3 border-2 border-dashed border-slate-700 rounded-lg hover:bg-slate-800 hover:border-indigo-500 transition text-slate-400 font-medium">
                                + Add World Element
                            </button>
                        </div>
                    </FlowCard>
                </div>
                
                {/* Section 5: Structure */}
                <FlowCard 
                    title="Outline" 
                    icon={<ListBulletIcon className="w-5 h-5"/>} 
                    color="blue"
                    onGenerate={handleGenerateOutline}
                    isLoading={loadingStates.outline}
                    generateLabel="Generate Outline"
                    generateDisabled={!storyData.synopsis || storyData.characters.length === 0}
                >
                    <div className="space-y-4">
                         {storyData.outline.length === 0 && (
                            <div className="text-center text-slate-500 py-12 italic">
                                Your chapter-by-chapter outline will appear here.
                            </div>
                        )}
                        {storyData.outline.map(chapter => (
                            <OutlineItem 
                                key={chapter.id} 
                                chapter={chapter} 
                                onUpdate={updateOutlineChapter}
                                onGenerateBeats={() => handleGenerateBeats(chapter)}
                            />
                        ))}
                    </div>
                </FlowCard>

                {/* Section 6: Writing Studio */}
                {activeChapterForGeneration && (
                    <div id="writing-studio" className="space-y-6 border-t border-slate-800 pt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center">
                                    <SparklesIcon className="w-6 h-6 mr-2 text-pink-500" />
                                    Writing Studio
                                </h2>
                                <p className="text-slate-400">Chapter: <span className="text-indigo-400 font-semibold">{activeChapterForGeneration.title}</span></p>
                            </div>
                            <button 
                                onClick={() => setActiveChapterForGeneration(null)}
                                className="text-sm text-slate-500 hover:text-white underline underline-offset-4"
                            >
                                Close Studio
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[800px]">
                            {/* Beats Column */}
                            <div className="lg:col-span-1 h-full">
                                 <FlowCard title="Story Beats" icon={<ListBulletIcon className="w-5 h-5"/>} color="purple" className="h-full">
                                    <div className="h-full flex flex-col">
                                        <div className="flex-grow overflow-y-auto pr-2 pb-4">
                                            {loadingStates.beats ? (
                                                <div className="flex items-center justify-center h-40 text-purple-400">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mr-3"></div>
                                                    Generating beats...
                                                </div>
                                            ) : (
                                                 <ul className="space-y-3">
                                                    {beats.map((beat, i) => (
                                                        <li key={beat.id} className="bg-slate-900 border border-slate-800 p-3 rounded text-sm text-slate-300 leading-snug">
                                                            <span className="text-purple-500 font-bold mr-2">{i + 1}.</span>
                                                            {beat.description}
                                                        </li>
                                                    ))}
                                                    {beats.length === 0 && !loadingStates.beats && (
                                                        <div className="text-slate-500 text-center py-4 italic">No beats generated yet.</div>
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                 </FlowCard>
                            </div>

                            {/* Prose Column */}
                            <div className="lg:col-span-2 h-full">
                                <FlowCard 
                                    title="Draft Prose" 
                                    icon={<BookOpenIcon className="w-5 h-5"/>} 
                                    color="pink"
                                    onGenerate={handleGenerateProse}
                                    isLoading={loadingStates.prose}
                                    generateLabel="Generate Prose"
                                    generateDisabled={beats.length === 0}
                                    className="h-full"
                                >
                                    <div className="h-full flex flex-col relative">
                                        {/* Copy button */}
                                        {draftProse && (
                                            <button 
                                                onClick={copyProseToClipboard}
                                                className="absolute top-0 right-0 z-10 p-2 text-xs bg-slate-800 text-slate-400 rounded-bl-lg hover:text-white hover:bg-slate-700 transition"
                                                title="Copy to clipboard"
                                            >
                                                Copy
                                            </button>
                                        )}
                                        <textarea
                                            className="w-full h-full p-6 bg-slate-900 border border-slate-800 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-300 font-serif text-lg leading-relaxed mb-10"
                                            placeholder={loadingStates.prose ? "Writing..." : "Your prose will appear here. Edit as needed."}
                                            value={draftProse}
                                            onChange={(e) => setDraftProse(e.target.value)}
                                        />
                                        {loadingStates.prose && (
                                            <div className="absolute bottom-4 left-6 text-pink-400 animate-pulse text-sm font-semibold">
                                                AI is writing...
                                            </div>
                                        )}
                                    </div>
                                </FlowCard>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
