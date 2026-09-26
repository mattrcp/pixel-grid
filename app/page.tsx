'use client';

import { EditorProvider } from '@/context/EditorContext';
import { Sidebar } from '@/components/Sidebar';
import { Canvas } from '@/components/Canvas';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function EditorApp() {
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <Canvas />
    </div>
  );
}

export default function Home() {
  return (
    <EditorProvider>
      <EditorApp />
    </EditorProvider>
  );
}
