
import { useState, useCallback } from 'react';
import { StoryData } from '../types';

interface HistoryState {
    past: StoryData[];
    present: StoryData;
    future: StoryData[];
}

export const useHistory = (initialState: StoryData) => {
    const [state, setState] = useState<HistoryState>({
        past: [],
        present: initialState,
        future: []
    });

    const canUndo = state.past.length > 0;
    const canRedo = state.future.length > 0;

    const undo = useCallback(() => {
        setState(currentState => {
            if (currentState.past.length === 0) return currentState;

            const previous = currentState.past[currentState.past.length - 1];
            const newPast = currentState.past.slice(0, currentState.past.length - 1);

            return {
                past: newPast,
                present: previous,
                future: [currentState.present, ...currentState.future]
            };
        });
    }, []);

    const redo = useCallback(() => {
        setState(currentState => {
            if (currentState.future.length === 0) return currentState;

            const next = currentState.future[0];
            const newFuture = currentState.future.slice(1);

            return {
                past: [...currentState.past, currentState.present],
                present: next,
                future: newFuture
            };
        });
    }, []);

    const set = useCallback((newPresent: StoryData) => {
        setState(currentState => {
            if (currentState.present === newPresent) return currentState;

            return {
                past: [...currentState.past, currentState.present],
                present: newPresent,
                future: []
            };
        });
    }, []);

    // Special setter that doesn't push to history (for initial loading)
    const init = useCallback((initial: StoryData) => {
         setState({
            past: [],
            present: initial,
            future: []
        });
    }, []);

    return {
        state: state.present,
        set,
        init,
        undo,
        redo,
        canUndo,
        canRedo,
        historyDepth: state.past.length
    };
};
