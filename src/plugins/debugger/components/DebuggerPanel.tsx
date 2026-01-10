import { useState, useEffect, useCallback } from 'react';
import { eventBus, Events } from '../../../core';
import './DebuggerPanel.css';

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
    <div className="debugger-panel">
      <div className="debugger-header">
        <span className="debugger-title">DEBUG</span>
      </div>

      <div className="debugger-config">
        <select
          value={selectedConfig}
          onChange={(e) => setSelectedConfig(e.target.value)}
          disabled={debugState !== 'idle'}
        >
          <option value="node">Node.js</option>
          <option value="python">Python</option>
          <option value="go">Go</option>
        </select>
      </div>

      <div className="debugger-controls">
        {debugState === 'idle' ? (
          <button className="control-btn start" onClick={handleStart} title="Start (F5)">
            ▶ Start
          </button>
        ) : (
          <>
            <button className="control-btn stop" onClick={handleStop} title="Stop (Shift+F5)">
              ⬛
            </button>
            {debugState === 'paused' && (
              <>
                <button className="control-btn" onClick={handleContinue} title="Continue (F8)">
                  ▶
                </button>
                <button className="control-btn" onClick={handleStepOver} title="Step Over (F10)">
                  ⤵
                </button>
                <button className="control-btn" onClick={handleStepInto} title="Step Into (F11)">
                  ↓
                </button>
                <button className="control-btn" onClick={handleStepOut} title="Step Out (Shift+F11)">
                  ↑
                </button>
              </>
            )}
          </>
        )}
      </div>

      {debugState !== 'idle' && (
        <div className="debugger-status">
          <span className={`status-indicator ${debugState}`} />
          <span>{debugState === 'running' ? 'Running...' : 'Paused'}</span>
        </div>
      )}

      <div className="debugger-content">
        <div className="debugger-section">
          <div className="section-header">
            <span>VARIABLES</span>
          </div>
          <div className="section-content">
            {variables.length === 0 ? (
              <div className="empty-message">No variables</div>
            ) : (
              variables.map((v, i) => (
                <div key={i} className="variable-item">
                  <span className="var-name">{v.name}</span>
                  <span className="var-value">{v.value}</span>
                  <span className="var-type">{v.type}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="debugger-section">
          <div className="section-header">
            <span>CALL STACK</span>
          </div>
          <div className="section-content">
            {stackFrames.length === 0 ? (
              <div className="empty-message">No call stack</div>
            ) : (
              stackFrames.map((frame) => (
                <div key={frame.id} className="stack-frame">
                  <span className="frame-name">{frame.name}</span>
                  <span className="frame-location">
                    {frame.path.split('/').pop()}:{frame.line}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="debugger-section">
          <div className="section-header">
            <span>BREAKPOINTS</span>
            <span className="bp-count">{breakpoints.length}</span>
          </div>
          <div className="section-content">
            {breakpoints.length === 0 ? (
              <div className="empty-message">No breakpoints</div>
            ) : (
              breakpoints.map((bp) => (
                <div key={bp.id} className="breakpoint-item">
                  <input
                    type="checkbox"
                    checked={bp.enabled}
                    onChange={() => handleToggleBreakpoint(bp.id)}
                  />
                  <span className="bp-location truncate">
                    {bp.path.split('/').pop()}:{bp.line}
                  </span>
                  <button
                    className="bp-remove"
                    onClick={() => handleRemoveBreakpoint(bp.id)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
