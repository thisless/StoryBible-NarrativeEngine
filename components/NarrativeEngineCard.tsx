
import React, { useState, useEffect } from 'react';
import { GenreModule, GenreTactic, ThematicAnalysisResult } from '../types';
import { SparklesIcon, ChevronDownIcon } from './icons';
import { NarrativeExploitProtocolEngine, PerturbationType } from '../services/narrativeExploitProtocol';
import { exploitLLMProvider, performThematicAnalysis } from '../services/geminiService';

interface NarrativeEngineCardProps {
    genreModule: GenreModule | null;
    currentGenre: string;
    onApplyTactic: (tactic: GenreTactic) => void;
    isProcessing: boolean;
}

const TACTIC_TYPES: PerturbationType[] = ["invert", "neutralize", "trojan", "corrupt", "paradox", "reduce"];

export const NarrativeEngineCard: React.FC<NarrativeEngineCardProps> = ({ 
    genreModule, 
    currentGenre, 
    onApplyTactic,
    isProcessing 
}) => {
    const [mode, setMode] = useState<'standard' | 'deep' | 'thematic'>('standard');
    const [protocolLogs, setProtocolLogs] = useState<any[]>([]);
    const [isRunningProtocol, setIsRunningProtocol] = useState(false);
    const [showConfig, setShowConfig] = useState(false);

    // Thematic Analysis State
    const [isAnalyzingTheme, setIsAnalyzingTheme] = useState(false);
    const [thematicResult, setThematicResult] = useState<ThematicAnalysisResult | null>(null);

    // Deep Protocol Configuration State
    const [scanConfig, setScanConfig] = useState({
        similarityThreshold: 0.7,
        atomConfidence: 0.6,
        chainDepth: 2,
        riskProfile: 'balanced' as 'conservative' | 'balanced' | 'aggressive' | 'destructive',
        maxIntensity: 0.8,
        preferredTactics: ['invert', 'paradox'] as PerturbationType[],
        avoidTactics: [] as PerturbationType[]
    });

    // Load logs from local storage on mount
    useEffect(() => {
        try {
            const savedLogs = localStorage.getItem('storyBible_protocolLogs');
            if (savedLogs) {
                setProtocolLogs(JSON.parse(savedLogs));
            }
        } catch (e) {
            console.error("Failed to load protocol logs:", e);
        }
    }, []);

    // Save logs to local storage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('storyBible_protocolLogs', JSON.stringify(protocolLogs));
        } catch (e) {
            console.error("Failed to save protocol logs:", e);
        }
    }, [protocolLogs]);

    const handleRunProtocol = async () => {
        setIsRunningProtocol(true);
        try {
            const engine = new NarrativeExploitProtocolEngine({ llmProvider: exploitLLMProvider });
            
            // Mock graph creation (in a real app, this would be derived from the actual story state)
            const mockGraph = { 
                essentialNodes: [], 
                causalLinks: [], 
                axioms: [{ id: 'core', statement: `Genre is ${currentGenre}`, criticality: 'essential' }], 
                scenes: [] 
            };
            // Use local storage content if available to act as source
            const storyDataStr = localStorage.getItem('storyBibleData');
            const storyData = storyDataStr ? JSON.parse(storyDataStr) : { synopsis: 'No synopsis.', braindump: 'No braindump.' };
            const content = `Synopsis: ${storyData.synopsis}\nBraindump: ${storyData.braindump}`;

            const mockVariant = { id: 'baseline', content };
            
            const result = await engine.runExploit(
                `session_${Date.now()}`,
                'Deep analysis run',
                mockVariant,
                mockGraph as any, 
                {
                    clusterParams: { 
                        minWeight: 0.5, 
                        maxClusters: 2, 
                        similarityThreshold: scanConfig.similarityThreshold 
                    },
                    atomThreshold: scanConfig.atomConfidence,
                    chainDepth: scanConfig.chainDepth,
                    tacticRules: { 
                        maxIntensity: scanConfig.maxIntensity, 
                        preferredTypes: scanConfig.preferredTactics,
                        avoidTypes: scanConfig.avoidTactics
                    },
                    applyMode: 'dry_run',
                    riskProfile: scanConfig.riskProfile,
                    minCoherence: 0.4,
                    maxDissonance: 0.8,
                    revertOnSevere: true,
                    parallelClusters: 1,
                    dryRunFirst: true,
                    llmTemperature: 0.7,
                    timeoutMs: 30000
                }
            );
            
            setProtocolLogs(prev => [result.explLog, ...prev]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsRunningProtocol(false);
        }
    };

    const handleRunThematicAnalysis = async () => {
        setIsAnalyzingTheme(true);
        try {
            const storyDataStr = localStorage.getItem('storyBibleData');
            if (!storyDataStr) return;
            const storyData = JSON.parse(storyDataStr);
            
            const result = await performThematicAnalysis(storyData);
            setThematicResult(result);
        } catch (error) {
            console.error("Thematic analysis failed:", error);
        } finally {
            setIsAnalyzingTheme(false);
        }
    };

    const handleExportResults = (log: any) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(log, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `scan_results_${log.runId}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const toggleTactic = (tactic: PerturbationType, listType: 'preferred' | 'avoid') => {
        setScanConfig(prev => {
            const list = listType === 'preferred' ? prev.preferredTactics : prev.avoidTactics;
            const otherListKey = listType === 'preferred' ? 'avoidTactics' : 'preferredTactics';
            
            let newList;
            if (list.includes(tactic)) {
                newList = list.filter(t => t !== tactic);
            } else {
                newList = [...list, tactic];
            }

            // Remove from the other list if adding to this one
            const otherList = prev[otherListKey].filter(t => t !== tactic);

            return {
                ...prev,
                [listType === 'preferred' ? 'preferredTactics' : 'avoidTactics']: newList,
                [otherListKey]: otherList
            };
        });
    };

    if (!currentGenre) return null;

    return (
        <div className="rounded-xl shadow-lg bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 overflow-hidden mb-6">
            <header className="px-4 py-3 border-b border-indigo-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-5 h-5 text-indigo-300" />
                    <h2 className="font-bold text-sm uppercase tracking-wide text-indigo-100">
                        Narrative Engine {genreModule ? `: ${genreModule.name} Module` : ''}
                    </h2>
                </div>
                <div className="flex space-x-2">
                     <button 
                        onClick={() => setMode('standard')}
                        className={`text-xs px-2 py-1 rounded transition ${mode === 'standard' ? 'bg-indigo-500/40 text-white' : 'text-indigo-300 hover:text-white'}`}
                    >
                        Standard
                    </button>
                    <button 
                        onClick={() => setMode('deep')}
                        className={`text-xs px-2 py-1 rounded transition ${mode === 'deep' ? 'bg-indigo-500/40 text-white' : 'text-indigo-300 hover:text-white'}`}
                    >
                        Deep Protocol
                    </button>
                    <button 
                        onClick={() => setMode('thematic')}
                        className={`text-xs px-2 py-1 rounded transition ${mode === 'thematic' ? 'bg-indigo-500/40 text-white' : 'text-indigo-300 hover:text-white'}`}
                    >
                        Thematic
                    </button>
                </div>
            </header>
            
            <div className="p-4">
                {mode === 'standard' && (
                    !genreModule ? (
                        <p className="text-slate-400 text-sm italic">
                            No specific module found for "{currentGenre}". Try "Mystery", "Romance", or "Sci-Fi" to unlock specialized tactics.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-xs text-indigo-200/70 mb-2">
                                Axioms: {genreModule.coreAxioms.map(a => a.statement).join(' • ')}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {genreModule.tactics.map(tactic => (
                                    <button
                                        key={tactic.id}
                                        onClick={() => onApplyTactic(tactic)}
                                        disabled={isProcessing}
                                        className="group relative flex flex-col items-start p-3 bg-slate-900/50 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-400/50 rounded-lg transition text-left"
                                    >
                                        <div className="flex justify-between w-full mb-1">
                                            <span className="text-sm font-semibold text-indigo-100 group-hover:text-white">
                                                {tactic.name}
                                            </span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                                tactic.type === 'hijack' ? 'border-red-500/30 text-red-300 bg-red-900/20' :
                                                tactic.type === 'paradox' ? 'border-purple-500/30 text-purple-300 bg-purple-900/20' :
                                                'border-blue-500/30 text-blue-300 bg-blue-900/20'
                                            }`}>
                                                {tactic.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2 leading-snug">
                                            {tactic.description}
                                        </p>
                                        <div className="mt-auto w-full flex justify-between text-[10px] text-slate-500">
                                            <span>Target: {tactic.targetSection}</span>
                                            <span>Dissonance: {tactic.dissonanceScore}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )
                )}

                {mode === 'deep' && (
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-indigo-200 font-semibold mb-1">Exploit Protocol (Experimental)</h3>
                                <p className="text-xs text-slate-400 max-w-md">
                                    Automated deep scan of narrative structure. Extracts axioms, analyzes consistency, and generates high-leverage narrative fragments.
                                </p>
                            </div>
                             <div className="flex space-x-2">
                                <button
                                    onClick={() => setShowConfig(!showConfig)}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold rounded shadow-sm transition border border-slate-700 flex items-center"
                                >
                                    <span>Configuration</span>
                                    <ChevronDownIcon className={`w-3 h-3 ml-1 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
                                </button>
                                <button
                                    onClick={handleRunProtocol}
                                    disabled={isRunningProtocol}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded shadow-lg transition"
                                >
                                    {isRunningProtocol ? 'Analyzing...' : 'Run Deep Scan'}
                                </button>
                             </div>
                        </div>

                        {showConfig && (
                            <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                {/* Scan Parameters */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Scan Parameters</h4>
                                    
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <label className="text-slate-400">Cluster Similarity</label>
                                            <span className="text-indigo-200">{scanConfig.similarityThreshold}</span>
                                        </div>
                                        <input 
                                            type="range" min="0.1" max="1" step="0.1" 
                                            value={scanConfig.similarityThreshold}
                                            onChange={(e) => setScanConfig({...scanConfig, similarityThreshold: parseFloat(e.target.value)})}
                                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <label className="text-slate-400">Atom Confidence</label>
                                            <span className="text-indigo-200">{scanConfig.atomConfidence}</span>
                                        </div>
                                        <input 
                                            type="range" min="0.1" max="1" step="0.1"
                                            value={scanConfig.atomConfidence}
                                            onChange={(e) => setScanConfig({...scanConfig, atomConfidence: parseFloat(e.target.value)})}
                                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-400 block mb-1">Chain Depth</label>
                                            <input 
                                                type="number" min="1" max="5"
                                                value={scanConfig.chainDepth}
                                                onChange={(e) => setScanConfig({...scanConfig, chainDepth: parseInt(e.target.value)})}
                                                className="w-full bg-slate-800 border border-slate-600 text-white text-xs rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 block mb-1">Risk Profile</label>
                                            <select 
                                                value={scanConfig.riskProfile}
                                                onChange={(e) => setScanConfig({...scanConfig, riskProfile: e.target.value as any})}
                                                className="w-full bg-slate-800 border border-slate-600 text-white text-xs rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500"
                                            >
                                                <option value="conservative">Conservative</option>
                                                <option value="balanced">Balanced</option>
                                                <option value="aggressive">Aggressive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Tactic Configuration */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Narrative Tactics</h4>
                                    
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <label className="text-slate-400">Max Intensity</label>
                                            <span className="text-indigo-200">{scanConfig.maxIntensity}</span>
                                        </div>
                                        <input 
                                            type="range" min="0.1" max="1" step="0.1"
                                            value={scanConfig.maxIntensity}
                                            onChange={(e) => setScanConfig({...scanConfig, maxIntensity: parseFloat(e.target.value)})}
                                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-slate-400 block mb-1">Preferred</label>
                                            <div className="space-y-1 max-h-24 overflow-y-auto">
                                                {TACTIC_TYPES.map(t => (
                                                    <label key={t} className="flex items-center space-x-2 text-[10px] text-slate-300 cursor-pointer hover:text-white">
                                                        <input 
                                                            type="checkbox"
                                                            checked={scanConfig.preferredTactics.includes(t)}
                                                            onChange={() => toggleTactic(t, 'preferred')}
                                                            className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-0 w-3 h-3"
                                                        />
                                                        <span className="capitalize">{t}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 block mb-1">Avoid</label>
                                            <div className="space-y-1 max-h-24 overflow-y-auto">
                                                {TACTIC_TYPES.map(t => (
                                                    <label key={t} className="flex items-center space-x-2 text-[10px] text-slate-300 cursor-pointer hover:text-white">
                                                        <input 
                                                            type="checkbox"
                                                            checked={scanConfig.avoidTactics.includes(t)}
                                                            onChange={() => toggleTactic(t, 'avoid')}
                                                            className="rounded border-slate-600 bg-slate-700 text-red-500 focus:ring-0 w-3 h-3"
                                                        />
                                                        <span className="capitalize">{t}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-3 min-h-[150px] max-h-[400px] overflow-y-auto font-mono text-xs">
                            {protocolLogs.length === 0 ? (
                                <span className="text-slate-600 italic">No protocols run this session.</span>
                            ) : (
                                protocolLogs.map((log) => (
                                    <div key={log.id} className="mb-4 relative group">
                                        <div className="flex justify-between items-start">
                                            <div className="text-green-400 font-bold mb-1">Run ID: {log.runId}</div>
                                            <button 
                                                onClick={() => handleExportResults(log)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded text-[10px]"
                                            >
                                                Export JSON
                                            </button>
                                        </div>
                                        <div className="pl-2 border-l border-slate-700 space-y-1 mb-2">
                                            {log.steps.map((step: any) => (
                                                <div key={step.stepNumber} className="flex justify-between text-slate-400">
                                                    <span>{step.stepNumber}. {step.stepName}</span>
                                                    <span>{step.durationMs}ms</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Fragments Display */}
                                        {log.fragments && log.fragments.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                <div className="text-indigo-300 font-semibold border-b border-indigo-500/20 pb-1">
                                                    Generated Fragments ({log.fragments.length})
                                                </div>
                                                {log.fragments.map((frag: any, i: number) => (
                                                    <div key={frag.id} className="bg-slate-900/60 p-2 rounded border border-slate-800">
                                                        <div className="flex justify-between mb-1">
                                                            <span className="text-xs text-orange-300 font-bold">{frag.type}</span>
                                                            <span className="text-[10px] text-slate-500">from {frag.nodeProvenance}</span>
                                                        </div>
                                                        <p className="text-slate-300 mb-1">{frag.content}</p>
                                                        <p className="text-[10px] text-indigo-400/80 italic">Usage: {frag.deploymentNote}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {mode === 'thematic' && (
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-indigo-200 font-semibold mb-1">Thematic Structure & Development</h3>
                                <p className="text-xs text-slate-400 max-w-md">
                                    Analyzes your narrative to identify the core theme, visualizes beat relationships, and generates new scene concepts to strengthen thematic resonance.
                                </p>
                            </div>
                            <button
                                onClick={handleRunThematicAnalysis}
                                disabled={isAnalyzingTheme}
                                className="px-4 py-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-xs font-bold rounded shadow-lg transition"
                            >
                                {isAnalyzingTheme ? 'Analyzing...' : 'Analyze Structure'}
                            </button>
                        </div>

                        {thematicResult && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                {/* Core Theme */}
                                <div className="bg-slate-900/40 p-4 rounded-lg border border-pink-500/30">
                                    <h4 className="text-xs font-bold text-pink-300 uppercase tracking-wider mb-2">Core Theme</h4>
                                    <p className="text-lg text-white font-serif italic">{thematicResult.coreTheme}</p>
                                </div>

                                {/* Beat Visualization */}
                                <div>
                                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3">Beat Relationships</h4>
                                    <div className="relative border-l-2 border-indigo-900/50 space-y-4 ml-2 pl-4">
                                        {thematicResult.beatRelationships.map((rel, idx) => (
                                            <div key={idx} className="relative bg-slate-800/50 p-3 rounded border border-slate-700">
                                                <div className="absolute -left-[25px] top-4 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500"></div>
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                                                    <div className="flex-1 font-semibold text-slate-300">{rel.sourceBeat}</div>
                                                    <div className="text-indigo-400 font-mono px-2">→ {rel.relationship} →</div>
                                                    <div className="flex-1 font-semibold text-slate-300 text-right">{rel.targetBeat}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Scene Concepts */}
                                <div>
                                    <h4 className="text-xs font-bold text-green-300 uppercase tracking-wider mb-3">Generated Scene Concepts</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {thematicResult.sceneConcepts.map((scene, idx) => (
                                            <div key={idx} className="bg-slate-900 border border-slate-700 p-4 rounded-lg hover:border-green-500/30 transition">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="font-bold text-slate-200 text-sm">{scene.title}</h5>
                                                    <span className="text-[10px] bg-green-900/30 text-green-300 px-2 py-0.5 rounded border border-green-900/50">
                                                        {scene.setting}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 mb-2 italic">{scene.purpose}</p>
                                                <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                                                    {scene.content}
                                                </p>
                                                <div className="border-t border-slate-800 pt-2 mt-2">
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="text-slate-500">Chars: {scene.characters}</span>
                                                        <span className="text-indigo-400">Advancement: {scene.advancement}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
