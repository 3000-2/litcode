import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { IconButton, Icon } from '../../../components';
import { eventBus, Events } from '../../../core';

const DEBOUNCE_MS = 300;

interface SearchMatch {
  path: string;
  line: number;
  column: number;
  content: string;
  matchStart: number;
  matchEnd: number;
}

interface SearchResult {
  matches: SearchMatch[];
  totalMatches: number;
  truncated: boolean;
}

type GroupedResults = Record<string, SearchMatch[]>;

export function SearchPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [rootPath, setRootPath] = useState('');
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    const unsub = eventBus.on('search:focus', () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return unsub;
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [caseSensitive, useRegex]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !rootPath) {
      setResults(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await invoke<SearchResult>('search_content', {
        rootPath,
        query: searchQuery,
        caseSensitive,
        useRegex,
      });
      setResults(result);
      
      const paths = new Set(result.matches.map(m => m.path));
      setExpandedFiles(paths);
    } catch (err) {
      setError(String(err));
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [rootPath, caseSensitive, useRegex]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, DEBOUNCE_MS);
  }, [performSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      performSearch(query);
    }
  }, [performSearch, query]);

  const handleResultClick = useCallback((match: SearchMatch) => {
    const id = `tab-${Date.now()}`;
    const name = match.path.split('/').pop() || match.path;
    
    eventBus.emit(Events.TAB_OPEN, {
      id,
      path: match.path,
      name,
    });
    eventBus.emit(Events.FILE_OPEN, { 
      id, 
      path: match.path, 
      name,
      line: match.line,
      column: match.column,
    });
  }, []);

  const toggleFileExpand = useCallback((path: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const groupedResults: GroupedResults = results
    ? results.matches.reduce<GroupedResults>((acc, match) => {
        (acc[match.path] ??= []).push(match);
        return acc;
      }, {})
    : {};

  const getRelativePath = (fullPath: string) => {
    if (rootPath && fullPath.startsWith(rootPath)) {
      return fullPath.slice(rootPath.length + 1);
    }
    return fullPath;
  };

  const renderHighlightedContent = useCallback((match: SearchMatch) => {
    const { content, matchStart, matchEnd } = match;
    const trimmedContent = content.trim();
    const leadingSpaces = content.length - content.trimStart().length;
    const adjustedStart = matchStart - leadingSpaces;
    const adjustedEnd = matchEnd - leadingSpaces;

    if (adjustedStart < 0 || adjustedEnd > trimmedContent.length) {
      return <span className="text-fg-secondary">{trimmedContent}</span>;
    }

    const before = trimmedContent.slice(0, adjustedStart);
    const highlighted = trimmedContent.slice(adjustedStart, adjustedEnd);
    const after = trimmedContent.slice(adjustedEnd);

    return (
      <>
        <span className="text-fg-secondary">{before}</span>
        <span className="bg-yellow-500/30 text-yellow-300">{highlighted}</span>
        <span className="text-fg-secondary">{after}</span>
      </>
    );
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-3 py-2 min-h-header border-b border-default">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-secondary">
          SEARCH
        </span>
        <div className="flex gap-1">
          <IconButton
            icon="refresh"
            size="sm"
            onClick={() => performSearch(query)}
            title="Search"
            disabled={!query.trim()}
          />
        </div>
      </div>

      <div className="px-3 py-2 border-b border-default space-y-2">
        <div className="relative flex items-center">
          <Icon name="search" size={14} className="absolute left-2.5 text-fg-muted pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            className="w-full pl-[30px] px-2.5 py-1.5 text-sm border rounded bg-secondary text-fg-primary border-default transition-colors duration-150 focus:outline-none focus:border-accent placeholder:text-fg-muted"
          />
        </div>
        
        <div className="flex gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-fg-secondary hover:text-fg-primary">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="w-3 h-3"
            />
            <span>Aa</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-fg-secondary hover:text-fg-primary">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              className="w-3 h-3"
            />
            <span>.*</span>
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="py-6 px-3 text-center text-sm text-fg-secondary">
            Searching...
          </div>
        )}

        {error && (
          <div className="py-6 px-3 text-center text-sm text-diff-removed">
            {error}
          </div>
        )}

        {!loading && !error && results && results.matches.length === 0 && (
          <div className="py-6 px-3 text-center text-sm text-fg-secondary">
            No results found
          </div>
        )}

        {!loading && !error && results && results.matches.length > 0 && (
          <div className="py-1">
            {results.truncated && (
              <div className="px-3 py-1 text-xs text-yellow-500">
                Results truncated to {results.totalMatches} matches
              </div>
            )}
            
            <div className="px-3 py-1 text-xs text-fg-secondary">
              {results.totalMatches} results in {Object.keys(groupedResults).length} files
            </div>

            {Object.entries(groupedResults).map(([path, matches]) => (
              <div key={path} className="border-b border-default last:border-b-0">
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-hover"
                  onClick={() => toggleFileExpand(path)}
                >
                  <span className="text-xs text-fg-muted">
                    {expandedFiles.has(path) ? '▼' : '▶'}
                  </span>
                  <span className="text-sm text-fg-primary truncate flex-1">
                    {getRelativePath(path)}
                  </span>
                  <span className="text-xs text-fg-muted">
                    {matches.length}
                  </span>
                </button>

                {expandedFiles.has(path) && (
                  <div className="pb-1">
                    {matches.map((match, idx) => (
                      <button
                        key={`${match.line}-${match.column}-${idx}`}
                        className="w-full flex items-start gap-2 px-3 py-1 text-left hover:bg-hover group"
                        onClick={() => handleResultClick(match)}
                      >
                        <span className="text-xs text-fg-muted w-8 text-right shrink-0">
                          {match.line}
                        </span>
                        <span className="text-xs font-mono truncate flex-1">
                          {renderHighlightedContent(match)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && !error && !results && query === '' && (
          <div className="py-6 px-3 text-center text-sm text-fg-secondary">
            Enter a search term
          </div>
        )}
      </div>
    </div>
  );
}
