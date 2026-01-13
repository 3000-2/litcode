import { useEffect, useRef, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { IconButton } from '../../../components';
import { eventBus } from '../../../core';
import '@xterm/xterm/css/xterm.css';

const TERMINAL_THEME = {
  background: '#1e1e1e',
  foreground: '#cccccc',
  cursor: '#cccccc',
  cursorAccent: '#1e1e1e',
  selectionBackground: '#264f78',
  black: '#1e1e1e',
  red: '#f44747',
  green: '#6a9955',
  yellow: '#d7ba7d',
  blue: '#569cd6',
  magenta: '#c586c0',
  cyan: '#4ec9b0',
  white: '#d4d4d4',
  brightBlack: '#808080',
  brightRed: '#f44747',
  brightGreen: '#6a9955',
  brightYellow: '#d7ba7d',
  brightBlue: '#569cd6',
  brightMagenta: '#c586c0',
  brightCyan: '#4ec9b0',
  brightWhite: '#ffffff',
} as const;

interface TerminalInstance {
  id: string;
  terminal: Terminal;
  fitAddon: FitAddon;
  unlistenData: UnlistenFn | null;
  unlistenExit: UnlistenFn | null;
}

export function TerminalPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [terminals, setTerminals] = useState<TerminalInstance[]>([]);
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null);
  const [rootPath, setRootPath] = useState<string>('');

  useEffect(() => {
    invoke<string>('get_initial_path')
      .then((initialPath) => {
        if (initialPath) {
          setRootPath(initialPath);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const unsub = eventBus.on('root-path:change', (data) => {
      const { path } = data as { path: string };
      setRootPath(path);
    });
    return unsub;
  }, []);

  const handleTerminalExitRef = useRef<(id: string) => void>(() => {});

  const spawnTerminal = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      const result = await invoke<{ id: string }>('terminal_spawn', {
        cwd: rootPath || undefined,
        rows: 24,
        cols: 80,
      });

      const terminal = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: 'JetBrains Mono, SF Mono, Menlo, monospace',
        theme: TERMINAL_THEME,
      });

      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);

      const unlistenData = await listen<number[]>(`terminal:data:${result.id}`, (event) => {
        const data = new Uint8Array(event.payload);
        terminal.write(data);
      });

      const unlistenExit = await listen(`terminal:exit:${result.id}`, () => {
        handleTerminalExitRef.current(result.id);
      });

      terminal.onData((data) => {
        invoke('terminal_write', {
          id: result.id,
          data: Array.from(new TextEncoder().encode(data)),
        });
      });

      terminal.onResize(({ cols, rows }) => {
        invoke('terminal_resize', { id: result.id, cols, rows });
      });

      const instance: TerminalInstance = {
        id: result.id,
        terminal,
        fitAddon,
        unlistenData,
        unlistenExit,
      };

      setTerminals((prev) => [...prev, instance]);
      setActiveTerminalId(result.id);
    } catch (err) {
      console.error('Failed to spawn terminal:', err);
    }
  }, [rootPath]);

  const handleTerminalExit = useCallback((id: string) => {
    setTerminals((prev) => {
      const instance = prev.find((t) => t.id === id);
      if (instance) {
        instance.unlistenData?.();
        instance.unlistenExit?.();
        instance.terminal.dispose();
      }
      const remaining = prev.filter((t) => t.id !== id);

      setActiveTerminalId((currentActive) => {
        if (currentActive === id) {
          return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
        }
        return currentActive;
      });

      return remaining;
    });
  }, []);

  handleTerminalExitRef.current = handleTerminalExit;

  const killTerminal = useCallback(async (id: string) => {
    try {
      await invoke('terminal_kill', { id });
      handleTerminalExit(id);
    } catch (err) {
      console.error('Failed to kill terminal:', err);
    }
  }, [handleTerminalExit]);

  const clearTerminal = useCallback(() => {
    const instance = terminals.find((t) => t.id === activeTerminalId);
    if (instance) {
      instance.terminal.clear();
    }
  }, [terminals, activeTerminalId]);

  useEffect(() => {
    const unsubNew = eventBus.on('terminal:new', () => {
      spawnTerminal();
    });

    const unsubClear = eventBus.on('terminal:clear', () => {
      clearTerminal();
    });

    return () => {
      unsubNew();
      unsubClear();
    };
  }, [spawnTerminal, clearTerminal]);

  useEffect(() => {
    const instance = terminals.find((t) => t.id === activeTerminalId);
    if (instance && containerRef.current) {
      containerRef.current.innerHTML = '';
      instance.terminal.open(containerRef.current);
      instance.fitAddon.fit();
      instance.terminal.focus();
    }
  }, [activeTerminalId, terminals]);

  useEffect(() => {
    const handleResize = () => {
      const instance = terminals.find((t) => t.id === activeTerminalId);
      if (instance) {
        instance.fitAddon.fit();
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [activeTerminalId, terminals]);

  const terminalsRef = useRef<TerminalInstance[]>([]);
  terminalsRef.current = terminals;

  useEffect(() => {
    return () => {
      terminalsRef.current.forEach((instance) => {
        instance.unlistenData?.();
        instance.unlistenExit?.();
        instance.terminal.dispose();
        invoke('terminal_kill', { id: instance.id });
      });
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-3 py-2 min-h-header border-b border-default">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-secondary">
          TERMINAL
        </span>
        <div className="flex gap-1">
          <IconButton
            icon="plus"
            size="sm"
            onClick={spawnTerminal}
            title="New Terminal"
          />
          <IconButton
            icon="trash"
            size="sm"
            onClick={() => activeTerminalId && killTerminal(activeTerminalId)}
            title="Kill Terminal"
            disabled={!activeTerminalId}
          />
        </div>
      </div>

      {terminals.length > 1 && (
        <div className="flex gap-1 px-2 py-1 border-b border-default overflow-x-auto">
          {terminals.map((instance, index) => (
            <button
              key={instance.id}
              className={`px-2 py-0.5 text-xs rounded ${
                instance.id === activeTerminalId
                  ? 'bg-accent text-white'
                  : 'bg-tertiary text-fg-secondary hover:bg-hover'
              }`}
              onClick={() => setActiveTerminalId(instance.id)}
            >
              Terminal {index + 1}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {terminals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-fg-secondary">
            <p className="text-sm mb-2">No terminal open</p>
            <button
              className="px-3 py-1.5 text-sm bg-accent text-white rounded hover:bg-accent-hover"
              onClick={spawnTerminal}
            >
              New Terminal
            </button>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="h-full w-full p-1"
            style={{ backgroundColor: TERMINAL_THEME.background }}
          />
        )}
      </div>
    </div>
  );
}
