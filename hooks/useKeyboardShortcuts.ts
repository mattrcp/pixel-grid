'use client';

import { useEffect } from 'react';
import { useEditor } from '@/context/EditorContext';
import { Tool } from '@/lib/types';

const toolShortcuts: Record<string, Tool> = {
  b: 'brush',
  e: 'eraser',
  g: 'fill',
  i: 'eyedropper',
  s: 'select',
};

export function useKeyboardShortcuts() {
  const { dispatch, undo, redo, state } = useEditor();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const isMeta = e.metaKey || e.ctrlKey;

      if (isMeta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if (isMeta && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }

      if (!isMeta && !e.altKey) {
        const tool = toolShortcuts[e.key.toLowerCase()];
        if (tool) {
          e.preventDefault();
          dispatch({ type: 'SET_TOOL', tool });
          return;
        }
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selection && !isMeta) {
          e.preventDefault();
          dispatch({ type: 'DELETE_SELECTION', layerId: state.activeLayerId, selection: state.selection });
        }
      }

      if (e.key === 'Escape') {
        dispatch({ type: 'SET_SELECTION', selection: null });
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, undo, redo, state.selection, state.activeLayerId]);
}
