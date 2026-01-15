import { useEffect, useRef, useCallback } from 'react';
import { MergeView } from '@codemirror/merge';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { go } from '@codemirror/lang-go';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { rust } from '@codemirror/lang-rust';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { sql } from '@codemirror/lang-sql';
import { yaml } from '@codemirror/lang-yaml';
import { xml } from '@codemirror/lang-xml';
import { StreamLanguage } from '@codemirror/language';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { oneDark } from '@codemirror/theme-one-dark';
import { invoke } from '@tauri-apps/api/core';
import { DiffToolbar } from './DiffToolbar';
import { useSettings } from '../../../../core';
import { eventBus, Events } from '../../../../core/event-bus';
import type { DiffTabInfo, DiffCollapseSettings } from '../../../../core/types';

interface SplitDiffViewProps {
  tabInfo: DiffTabInfo;
  onClose: () => void;
  onContentChange: (newContent: string) => void;
}

const baseTheme = EditorView.theme({
  '&': {
    height: '100%',
  },
  '.cm-scroller': {
    fontFamily: 'var(--editor-font-family)',
    fontSize: 'var(--editor-font-size)',
    lineHeight: 'var(--editor-line-height)',
  },
  '.cm-content': {
    padding: '4px 0',
  },
  '.cm-line': {
    padding: '0 4px',
  },
  '.cm-gutters': {
    paddingLeft: '8px',
  },
});

function getLanguageExtension(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return javascript();
    case 'ts':
    case 'tsx':
    case 'mts':
    case 'cts':
      return javascript({ typescript: true, jsx: true });
    case 'py':
    case 'pyw':
      return python();
    case 'go':
      return go();
    case 'json':
    case 'jsonc':
      return json();
    case 'md':
    case 'markdown':
    case 'mdx':
      return markdown();
    case 'html':
    case 'htm':
    case 'vue':
    case 'svelte':
      return html();
    case 'css':
    case 'scss':
    case 'less':
      return css();
    case 'rs':
      return rust();
    case 'c':
    case 'h':
      return cpp();
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'hpp':
    case 'hxx':
      return cpp();
    case 'java':
      return java();
    case 'sql':
      return sql();
    case 'yaml':
    case 'yml':
      return yaml();
    case 'xml':
    case 'svg':
    case 'xsl':
    case 'xslt':
      return xml();
    case 'sh':
    case 'bash':
    case 'zsh':
    case 'fish':
      return StreamLanguage.define(shell);
    case 'toml':
    case 'ini':
    case 'conf':
    case 'cfg':
    case 'env':
    case 'gitignore':
    case 'dockerignore':
    case 'editorconfig':
      return StreamLanguage.define(shell);
    default:
      return [];
  }
}

function getCollapseConfig(settings: DiffCollapseSettings) {
  if (!settings.enabled) return undefined;
  return {
    margin: settings.margin,
    minSize: settings.minSize,
  };
}

export function SplitDiffView({ tabInfo, onClose, onContentChange }: SplitDiffViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mergeViewRef = useRef<MergeView | null>(null);
  const { settings } = useSettings();
  
  const canRevert = !tabInfo.isUntracked && !tabInfo.staged;

  const createMergeView = useCallback(() => {
    if (!containerRef.current) return;

    if (mergeViewRef.current) {
      mergeViewRef.current.destroy();
    }

    const languageExt = getLanguageExtension(tabInfo.fileName);
    const collapseConfig = getCollapseConfig(settings.diffCollapse);

    const commonExtensions = [
      baseTheme,
      lineNumbers(),
      highlightActiveLine(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      oneDark,
      languageExt,
    ];

    const mergeView = new MergeView({
      a: {
        doc: tabInfo.originalContent,
        extensions: [
          ...commonExtensions,
          EditorState.readOnly.of(true),
          EditorView.editable.of(false),
        ],
      },
      b: {
        doc: tabInfo.modifiedContent,
        extensions: [
          ...commonExtensions,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onContentChange(update.state.doc.toString());
            }
          }),
        ],
      },
      parent: containerRef.current,
      orientation: 'a-b',
      revertControls: canRevert ? 'b-to-a' : undefined,
      renderRevertControl: canRevert ? createRevertButton : undefined,
      highlightChanges: true,
      gutter: true,
      collapseUnchanged: collapseConfig,
    });

    mergeViewRef.current = mergeView;
  }, [tabInfo, settings.diffCollapse, canRevert, onContentChange]);

  useEffect(() => {
    createMergeView();
    return () => {
      if (mergeViewRef.current) {
        mergeViewRef.current.destroy();
        mergeViewRef.current = null;
      }
    };
  }, [createMergeView]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'F7' && !e.shiftKey) {
        e.preventDefault();
        handleNextChunk();
      } else if (e.key === 'F7' && e.shiftKey) {
        e.preventDefault();
        handlePrevChunk();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleNextChunk = useCallback(() => {
    eventBus.emit(Events.DIFF_NAVIGATE_NEXT);
  }, []);

  const handlePrevChunk = useCallback(() => {
    eventBus.emit(Events.DIFF_NAVIGATE_PREV);
  }, []);

  const handleAcceptAll = useCallback(async () => {
    if (!mergeViewRef.current) return;
    
    const newContent = mergeViewRef.current.b.state.doc.toString();
    const fullPath = `${tabInfo.repoPath}/${tabInfo.filePath}`;
    
    try {
      await invoke('write_file', { path: fullPath, content: newContent });
      eventBus.emit('git:refresh');
      onClose();
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  }, [tabInfo, onClose]);

  const handleRejectAll = useCallback(async () => {
    try {
      await invoke('git_revert_file', { 
        repoPath: tabInfo.repoPath, 
        filePath: tabInfo.filePath 
      });
      eventBus.emit('git:refresh');
      onClose();
    } catch (err) {
      console.error('Failed to revert file:', err);
    }
  }, [tabInfo, onClose]);

  const getOriginalLabel = () => {
    if (tabInfo.isUntracked) return 'Empty (New File)';
    if (tabInfo.staged) return 'Original (HEAD)';
    return 'Original (HEAD)';
  };

  const getModifiedLabel = () => {
    if (tabInfo.staged) return 'Staged Changes';
    return 'Modified (Working Tree)';
  };

  return (
    <div className="flex flex-col h-full w-full">
      <DiffToolbar
        fileName={tabInfo.fileName}
        filePath={tabInfo.filePath}
        staged={tabInfo.staged}
        isUntracked={tabInfo.isUntracked}
        onClose={onClose}
        onPrevChunk={handlePrevChunk}
        onNextChunk={handleNextChunk}
        onAcceptAll={handleAcceptAll}
        onRejectAll={handleRejectAll}
        canRevert={canRevert}
      />
      
      <div className="flex border-b border-default">
        <div className="flex-1 px-3 py-1.5 bg-tertiary text-xs text-fg-secondary font-medium border-r border-default">
          {getOriginalLabel()}
        </div>
        <div className="flex-1 px-3 py-1.5 bg-tertiary text-xs text-fg-secondary font-medium">
          {getModifiedLabel()}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <div 
          ref={containerRef} 
          className="absolute inset-0 split-diff-container"
        />
      </div>
    </div>
  );
}

function createRevertButton(): HTMLElement {
  const button = document.createElement('button');
  button.className = 'diff-revert-btn';
  button.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>`;
  button.title = 'Revert this change';
  return button;
}
