import { useEffect, useRef, useState, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { invoke } from '@tauri-apps/api/core';
import { eventBus, Events, pluginRegistry } from '../../../core';
import { baseEditorTheme as baseTheme, getLanguageExtension } from '../../../lib/editor-utils';

export function Editor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const currentTabIdRef = useRef<string | null>(null);
  const originalContentRef = useRef<string>('');
  const loadRequestIdRef = useRef<number>(0);

  const createUpdateListener = useCallback((tabId: string) => {
    return EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const isDirty = update.state.doc.toString() !== originalContentRef.current;
        eventBus.emit(Events.TAB_DIRTY, { id: tabId, isDirty });
      }

      if (update.selectionSet) {
        const pos = update.state.selection.main.head;
        const line = update.state.doc.lineAt(pos);
        const col = pos - line.from + 1;
        pluginRegistry.registerStatusBar({
          id: 'editor-position',
          content: `Line ${line.number}, Col ${col}`,
          position: 'right',
          order: 100,
        });
      }
    });
  }, []);

  const createEditorState = useCallback((content: string, filename: string, tabId: string) => {
    return EditorState.create({
      doc: content,
      extensions: [
        baseTheme,
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        oneDark,
        getLanguageExtension(filename),
        createUpdateListener(tabId),
      ],
    });
  }, [createUpdateListener]);

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: '',
      extensions: [
        baseTheme,
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        oneDark,
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    const handleFileOpen = async (data: unknown) => {
      const { id, path, name } = data as { id: string; path: string; name: string };
      currentTabIdRef.current = id;
      const requestId = ++loadRequestIdRef.current;

      try {
        const content = await invoke<string>('read_file', { path });
        
        if (requestId !== loadRequestIdRef.current) return;
        
        originalContentRef.current = content;
        setCurrentPath(path);

        if (viewRef.current) {
          viewRef.current.setState(createEditorState(content, name, id));
        }

        pluginRegistry.setCurrentFile({ path, name, isDirectory: false });
      } catch (err) {
        console.error('Failed to open file:', err);
      }
    };

    const handleTabChange = async (data: unknown) => {
      const { id, path } = data as { id: string; path: string };
      currentTabIdRef.current = id;
      const requestId = ++loadRequestIdRef.current;

      try {
        const content = await invoke<string>('read_file', { path });
        
        if (requestId !== loadRequestIdRef.current) return;
        
        originalContentRef.current = content;
        setCurrentPath(path);

        if (viewRef.current) {
          const name = path.split('/').pop() || '';
          viewRef.current.setState(createEditorState(content, name, id));
        }
      } catch (err) {
        console.error('Failed to load file:', err);
      }
    };

    const handleSave = async () => {
      const path = currentPath;
      const tabId = currentTabIdRef.current;
      if (!path || !viewRef.current) return;

      const content = viewRef.current.state.doc.toString();
      try {
        await invoke('write_file', { path, content });
        originalContentRef.current = content;
        if (tabId) {
          eventBus.emit(Events.TAB_DIRTY, { id: tabId, isDirty: false });
        }
        eventBus.emit(Events.FILE_SAVE, { path });
      } catch (err) {
        console.error('Failed to save file:', err);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    const handleTabClose = (data: unknown) => {
      const { id } = data as { id: string };
      if (currentTabIdRef.current === id) {
        setCurrentPath(null);
        originalContentRef.current = '';
        currentTabIdRef.current = null;
        if (viewRef.current) {
          viewRef.current.setState(EditorState.create({
            doc: '',
            extensions: [
              baseTheme,
              lineNumbers(),
              highlightActiveLineGutter(),
              highlightActiveLine(),
              history(),
              keymap.of([...defaultKeymap, ...historyKeymap]),
              oneDark,
            ],
          }));
        }
        pluginRegistry.setCurrentFile(null);
      }
    };

    const unsubOpen = eventBus.on(Events.FILE_OPEN, handleFileOpen);
    const unsubChange = eventBus.on(Events.TAB_CHANGE, handleTabChange);
    const unsubClose = eventBus.on(Events.TAB_CLOSE, handleTabClose);
    const unsubSave = eventBus.on('editor:save', handleSave);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubOpen();
      unsubChange();
      unsubClose();
      unsubSave();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPath, createEditorState]);

  return (
    <div className="h-full w-full relative">
      <div ref={containerRef} className="h-full w-full [&_.cm-editor]:h-full" />
      {!currentPath && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary text-fg-muted text-sm">
          <p>Open a file to start editing</p>
        </div>
      )}
    </div>
  );
}
