
import React from 'react';
import { WorldbuildingElement, Trait } from '../types';
import { TrashIcon } from './icons';

interface WorldbuildingCardProps {
    element: WorldbuildingElement;
    onUpdate: (element: WorldbuildingElement) => void;
    onDelete: (id: string) => void;
}

export const WorldbuildingCard: React.FC<WorldbuildingCardProps> = ({ element, onUpdate, onDelete }) => {
    
    const handleTraitChange = (index: number, field: keyof Trait, value: string) => {
        const newTraits = [...element.traits];
        newTraits[index] = { ...newTraits[index], [field]: value };
        onUpdate({ ...element, traits: newTraits });
    };

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-3 h-full flex flex-col">
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <input
                        type="text"
                        value={element.name}
                        onChange={(e) => onUpdate({ ...element, name: e.target.value })}
                        className="text-lg font-bold bg-transparent w-full focus:bg-slate-800 rounded px-1 -mx-1"
                        placeholder="Element Name"
                    />
                    <select
                        value={element.type}
                        onChange={(e) => onUpdate({ ...element, type: e.target.value as WorldbuildingElement['type'] })}
                        className="text-sm text-indigo-400 bg-transparent w-full focus:bg-slate-800 rounded px-1 -mx-1 appearance-none"
                    >
                        <option value="Setting">Setting</option>
                        <option value="Item">Item</option>
                        <option value="Lore">Lore</option>
                        <option value="Magic System">Magic System</option>
                        <option value="Creature">Creature</option>
                        <option value="Custom">Custom</option>
                    </select>
                </div>
                 <button onClick={() => onDelete(element.id)} className="text-slate-500 hover:text-red-500 p-1">
                    <TrashIcon />
                </button>
            </div>

            <div className="space-y-2 flex-grow">
                {element.traits.map((trait, index) => (
                    <div key={index}>
                        <label className="text-xs font-semibold text-slate-400">{trait.name}</label>
                        <textarea
                            value={trait.value}
                            onChange={(e) => handleTraitChange(index, 'value', e.target.value)}
                            className="w-full text-sm p-2 mt-1 bg-slate-800 border border-slate-600 rounded-md resize-y focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            rows={3}
                            placeholder={`Details about ${trait.name}...`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
