
import React, { useState } from 'react';
import { Character, Trait } from '../types';
import { TrashIcon } from './icons';

interface CharacterCardProps {
    character: Character;
    onUpdate: (character: Character) => void;
    onDelete: (id: string) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onUpdate, onDelete }) => {
    const handleTraitChange = (index: number, field: keyof Trait, value: string) => {
        const newTraits = [...character.traits];
        newTraits[index] = { ...newTraits[index], [field]: value };
        onUpdate({ ...character, traits: newTraits });
    };

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-3 h-full flex flex-col">
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                     <input
                        type="text"
                        value={character.name}
                        onChange={(e) => onUpdate({ ...character, name: e.target.value })}
                        className="text-lg font-bold bg-transparent w-full focus:bg-slate-800 rounded px-1 -mx-1"
                        placeholder="Character Name"
                    />
                    <input
                        type="text"
                        value={character.role}
                        onChange={(e) => onUpdate({ ...character, role: e.target.value })}
                        className="text-sm text-indigo-400 bg-transparent w-full focus:bg-slate-800 rounded px-1 -mx-1"
                         placeholder="Role"
                    />
                </div>
                <button onClick={() => onDelete(character.id)} className="text-slate-500 hover:text-red-500 p-1">
                    <TrashIcon />
                </button>
            </div>

            <div className="space-y-2 flex-grow">
                {character.traits.map((trait, index) => (
                    <div key={index}>
                        <label className="text-xs font-semibold text-slate-400">{trait.name}</label>
                        <textarea
                            value={trait.value}
                            onChange={(e) => handleTraitChange(index, 'value', e.target.value)}
                            className="w-full text-sm p-2 mt-1 bg-slate-800 border border-slate-600 rounded-md resize-y focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            rows={2}
                            placeholder={`Details about ${trait.name}...`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
