import { useState, useEffect, useCallback } from 'react';
import { Circle } from 'lucide-react';
import { IconButton, Button, Select, EmptyState } from '../../../components';
import { cn } from '../../../lib/utils';
import { eventBus, Events } from '../../../core';

type DebugState = 'idle' | 'running' | 'paused';

interface Breakpoint {
  id: string;
  path: string;
  line: number;
  enabled: boolean;
}

interface StackFrame {
  id: number;
  name: string;
  path: string;
  line: number;
}

interface Variable {
  name: string;
  value: string;
  type: string;
}

export function DebuggerPanel() {
  const [debugState, setDebugState] = useState<DebugState>('idle');
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [stackFrames, setStackFrames] = useState<StackFrame[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string>('node');

  useEffect(() => {
    const savedBps = localStorage.getItem('litcode:breakpoints');
    if (savedBps) {
      try {
        setBreakpoints(JSON.parse(savedBps));
      } catch {
        setBreakpoints([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('litcode:breakpoints', JSON.stringify(breakpoints));
  }, [breakpoints]);

  const handleStart = useCallback(() => {
    setDebugState('running');
    eventBus.emit(Events.DEBUG_START, { config: selectedConfig });

    setTimeout(() => {
      setDebugState('paused');
      setStackFrames([
        { id: 0, name: 'main', path: '/example/index.js', line: 10 },
        { id: 1, name: 'init', path: '/example/index.js', line: 5 },
      ]);
      setVariables([
        { name: 'count', value: '42', type: 'number' },
        { name: 'name', value: '"Litcode"', type: 'string' },
        { name: 'isDebug', value: 'true', type: 'boolean' },
      ]);
    }, 500);
  }, [selectedConfig]);

  const handleStop = useCallback(() => {
    setDebugState('idle');
    setStackFrames([]);
    setVariables([]);
    eventBus.emit(Events.DEBUG_STOP);
  }, []);

  const handleContinue = useCallback(() => {
    setDebugState('running');
    eventBus.emit(Events.DEBUG_CONTINUE);
    setTimeout(() => setDebugState('paused'), 300);
  }, []);

  const handleStepOver = useCallback(() => {
    eventBus.emit('debug:step-over');
  }, []);

  const handleStepInto = useCallback(() => {
    eventBus.emit('debug:step-into');
  }, []);

  const handleStepOut = useCallback(() => {
    eventBus.emit('debug:step-out');
  }, []);

  useEffect(() => {
    const handleToggleBp = () => {
      const currentFile = localStorage.getItem('litcode:currentFile');
      if (!currentFile) return;

      const line = 1;
      setBreakpoints((prev) => {
        const existing = prev.find((bp) => bp.path === currentFile && bp.line === line);
        if (existing) {
          return prev.filter((bp) => bp.id !== existing.id);
        }
        return [...prev, { id: `bp-${Date.now()}`, path: currentFile, line, enabled: true }];
      });
    };

    const unsubToggle = eventBus.on('debug:toggle-breakpoint', handleToggleBp);
    const unsubStart = eventBus.on('debug:start-request', handleStart);
    const unsubStop = eventBus.on('debug:stop-request', handleStop);

    return () => {
      unsubToggle();
      unsubStart();
      unsubStop();
    };
  }, [handleStart, handleStop]);

  const handleRemoveBreakpoint = (id: string) => {
    setBreakpoints((prev) => prev.filter((bp) => bp.id !== id));
  };

  const handleToggleBreakpoint = (id: string) => {
    setBreakpoints((prev) =>
      prev.map((bp) => (bp.id === id ? { ...bp, enabled: !bp.enabled } : bp))
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-3 py-2 min-h-header border-b border-default">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-secondary">DEBUG</span>
      </div>

      <div className="px-3 py-2 border-b border-default">
        <Select
          value={selectedConfig}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedConfig(e.target.value)}
          disabled={debugState !== 'idle'}
        >
          <option value="node">Node.js</option>
          <option value="python">Python</option>
          <option value="go">Go</option>
        </Select>
      </div>

      <div className="flex gap-1 px-3 py-2 border-b border-default">
        {debugState === 'idle' ? (
          <Button icon="play" onClick={handleStart} title="Start (F5)" className="flex-1 bg-diff-added text-diff-added hover:bg-diff-added hover:text-white">
            Start
          </Button>
        ) : (
          <>
            <IconButton icon="square" onClick={handleStop} title="Stop (Shift+F5)" className="flex-1 bg-diff-removed text-diff-removed hover:bg-diff-removed hover:text-white" />
            {debugState === 'paused' && (
              <>
                <IconButton icon="play" onClick={handleContinue} title="Continue (F8)" className="flex-1 bg-tertiary hover:bg-hover" />
                <IconButton icon="step-forward" onClick={handleStepOver} title="Step Over (F10)" className="flex-1 bg-tertiary hover:bg-hover" />
                <IconButton icon="arrow-down" onClick={handleStepInto} title="Step Into (F11)" className="flex-1 bg-tertiary hover:bg-hover" />
                <IconButton icon="arrow-up" onClick={handleStepOut} title="Step Out (Shift+F11)" className="flex-1 bg-tertiary hover:bg-hover" />
              </>
            )}
          </>
        )}
      </div>

      {debugState !== 'idle' && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-default text-sm">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              debugState === 'running' ? 'bg-diff-added animate-pulse' : 'bg-diff-modified'
            )}
          />
          <span>{debugState === 'running' ? 'Running...' : 'Paused'}</span>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="border-b border-default">
          <div className="flex justify-between items-center px-3 py-2 text-xs font-semibold text-fg-secondary bg-tertiary cursor-pointer hover:bg-hover">
            <span>VARIABLES</span>
          </div>
          <div className="py-1">
            {variables.length === 0 ? (
              <EmptyState message="No variables" />
            ) : (
              variables.map((v, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 px-3 text-sm">
                  <span className="text-fg-primary font-medium">{v.name}</span>
                  <span className="flex-1 text-diff-added font-mono-editor">{v.value}</span>
                  <span className="text-fg-muted text-2xs">{v.type}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-b border-default">
          <div className="flex justify-between items-center px-3 py-2 text-xs font-semibold text-fg-secondary bg-tertiary cursor-pointer hover:bg-hover">
            <span>CALL STACK</span>
          </div>
          <div className="py-1">
            {stackFrames.length === 0 ? (
              <EmptyState message="No call stack" />
            ) : (
              stackFrames.map((frame) => (
                <div key={frame.id} className="flex flex-col py-1.5 px-3 cursor-pointer hover:bg-hover">
                  <span className="text-sm font-medium">{frame.name}</span>
                  <span className="text-xs text-fg-secondary">
                    {frame.path.split('/').pop()}:{frame.line}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-b border-default">
          <div className="flex justify-between items-center px-3 py-2 text-xs font-semibold text-fg-secondary bg-tertiary cursor-pointer hover:bg-hover">
            <span>BREAKPOINTS</span>
            <span className="bg-accent text-white px-1.5 py-0.5 rounded-full text-2xs">{breakpoints.length}</span>
          </div>
          <div className="py-1">
            {breakpoints.length === 0 ? (
              <EmptyState message="No breakpoints" />
            ) : (
              breakpoints.map((bp) => (
                <div key={bp.id} className="group flex items-center gap-2 py-1.5 px-3 text-sm">
                  <button
                    className={cn('w-4 h-4 flex items-center justify-center', bp.enabled ? 'text-diff-removed' : 'text-fg-muted')}
                    onClick={() => handleToggleBreakpoint(bp.id)}
                  >
                    <Circle size={10} strokeWidth={2} fill={bp.enabled ? 'currentColor' : 'none'} />
                  </button>
                  <span className="flex-1 font-mono-editor truncate">
                    {bp.path.split('/').pop()}:{bp.line}
                  </span>
                  <IconButton
                    icon="x"
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                    onClick={() => handleRemoveBreakpoint(bp.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
