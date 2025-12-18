import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastProps {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const colors = {
        success: 'bg-emerald-600/90 border-emerald-500 text-emerald-50',
        error: 'bg-red-600/90 border-red-500 text-red-50',
        info: 'bg-indigo-600/90 border-indigo-500 text-indigo-50',
    };

    return (
        <div className={`mb-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm flex items-center justify-between min-w-[320px] max-w-md animate-in slide-in-from-right fade-in duration-300 ${colors[toast.type]}`}>
            <span className="text-sm font-medium pr-4">{toast.message}</span>
            <button 
                onClick={() => onDismiss(toast.id)} 
                className="opacity-70 hover:opacity-100 transition-opacity p-1 -mr-2"
                aria-label="Close notification"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
            <div className="pointer-events-auto">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
                ))}
            </div>
        </div>
    );
};