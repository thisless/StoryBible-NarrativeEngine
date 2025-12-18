
import React from 'react';
import { OutlineChapter } from '../types';

interface OutlineItemProps {
    chapter: OutlineChapter;
    onUpdate: (chapter: OutlineChapter) => void;
    onGenerateBeats: () => void;
}

export const OutlineItem: React.FC<OutlineItemProps> = ({ chapter, onUpdate, onGenerateBeats }) => {
    return (
        <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
                <input
                    type="text"
                    value={chapter.title}
                    onChange={(e) => onUpdate({ ...chapter, title: e.target.value })}
                    className="text-lg font-semibold bg-transparent w-full focus:bg-slate-800 rounded px-1 -mx-1"
                />
                 <button
                    onClick={onGenerateBeats}
                    className="px-3 py-1 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition whitespace-nowrap"
                >
                    Generate Beats
                </button>
            </div>
            <textarea
                value={chapter.summary}
                onChange={(e) => onUpdate({ ...chapter, summary: e.target.value })}
                className="w-full text-sm text-slate-300 p-2 bg-slate-800 border border-slate-600 rounded-md resize-y focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
                placeholder="Chapter summary..."
            />
        </div>
    );
};
