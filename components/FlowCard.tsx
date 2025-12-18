import React, { ReactNode } from 'react';

interface FlowCardProps {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    color: string;
    onGenerate?: () => void;
    isLoading?: boolean;
    generateDisabled?: boolean;
    generateLabel?: string;
    generateTooltip?: string;
    className?: string;
}

const colorClasses: { [key: string]: string } = {
    red: 'bg-red-900/40 border-red-800 text-red-100',
    orange: 'bg-orange-900/40 border-orange-800 text-orange-100',
    green: 'bg-emerald-900/40 border-emerald-800 text-emerald-100',
    cyan: 'bg-cyan-900/40 border-cyan-800 text-cyan-100',
    blue: 'bg-blue-900/40 border-blue-800 text-blue-100',
    purple: 'bg-purple-900/40 border-purple-800 text-purple-100',
    pink: 'bg-pink-900/40 border-pink-800 text-pink-100',
    indigo: 'bg-indigo-900/40 border-indigo-800 text-indigo-100',
    slate: 'bg-slate-800/60 border-slate-700 text-slate-100',
};

const iconColorClasses: { [key: string]: string } = {
    white: 'text-slate-400',
    black: 'text-indigo-400'
}

export const FlowCard: React.FC<FlowCardProps> = ({
    title,
    icon,
    children,
    color,
    onGenerate,
    isLoading = false,
    generateDisabled = false,
    generateLabel = 'Generate',
    generateTooltip,
    className = '',
}) => {
    const headerStyle = colorClasses[color] || colorClasses['slate'];

    return (
        <div className={`flex flex-col rounded-xl shadow-lg bg-slate-900/80 border border-slate-800 overflow-hidden ${className}`}>
            <header className={`flex items-center justify-between px-4 py-3 border-b ${headerStyle}`}>
                <div className="flex items-center space-x-2">
                    <span className="opacity-80">{icon}</span>
                    <h2 className="font-bold text-sm uppercase tracking-wide opacity-90">{title}</h2>
                </div>
                 {onGenerate && (
                    <button
                        onClick={onGenerate}
                        disabled={isLoading || generateDisabled}
                        title={generateTooltip}
                        className="px-3 py-1 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center shadow-sm"
                    >
                        {isLoading ? (
                             <>
                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Working...
                            </>
                        ) : generateLabel}
                    </button>
                )}
            </header>
            <div className="flex-grow overflow-y-auto relative p-0">
                <div className="p-4 h-full">
                    {children}
                </div>
            </div>
        </div>
    );
};