import { useState, useEffect } from 'react';
import { Icon, IconButton } from '../components';
import { cn } from '../lib/utils';
import { eventBus, Events } from '../core';
import type { UnifiedTabInfo, FileTabInfo, DiffTabInfo } from '../core/types';

export function TabBar() {
  const [tabs, setTabs] = useState<UnifiedTabInfo[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  useEffect(() => {
    const handleFileTabOpen = (data: unknown) => {
      const { id, path, name } = data as { id: string; path: string; name: string };
      setTabs((prev) => {
        const exists = prev.find((t) => t.type === 'file' && (t as FileTabInfo).path === path);
        if (exists) {
          setActiveTabId(exists.id);
          return prev;
        }
        const newTab: FileTabInfo = { id, type: 'file', path, name, isDirty: false };
        setActiveTabId(id);
        return [...prev, newTab];
      });
    };

    const handleDiffTabOpen = (data: unknown) => {
      const diffData = data as DiffTabInfo;
      setTabs((prev) => {
        const exists = prev.find(
          (t) => t.type === 'diff' && (t as DiffTabInfo).filePath === diffData.filePath
        );
        if (exists) {
          setActiveTabId(exists.id);
          const updated = prev.map((t) =>
            t.id === exists.id ? { ...diffData, id: exists.id } : t
          );
          return updated;
        }
        setActiveTabId(diffData.id);
        return [...prev, diffData];
      });
    };

    const handleTabClose = (data: unknown) => {
      const { id } = data as { id: string };
      setTabs((prev) => {
        const newTabs = prev.filter((t) => t.id !== id);

        setActiveTabId((currentActiveId) => {
          if (currentActiveId === id) {
            const newActiveTab = newTabs[newTabs.length - 1];
            if (newActiveTab) {
              setTimeout(() => {
                emitTabChange(newActiveTab);
              }, 0);
              return newActiveTab.id;
            }
            return null;
          }
          return currentActiveId;
        });

        return newTabs;
      });
    };

    const handleTabDirty = (data: unknown) => {
      const { id, isDirty } = data as { id: string; isDirty: boolean };
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === id && t.type === 'file') {
            return { ...t, isDirty } as FileTabInfo;
          }
          return t;
        })
      );
    };

    const handleDiffTabUpdate = (data: unknown) => {
      const { id, modifiedContent } = data as { id: string; modifiedContent: string };
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === id && t.type === 'diff') {
            return { ...t, modifiedContent } as DiffTabInfo;
          }
          return t;
        })
      );
    };

    const unsubFileOpen = eventBus.on(Events.TAB_OPEN, handleFileTabOpen);
    const unsubDiffOpen = eventBus.on(Events.DIFF_TAB_OPEN, handleDiffTabOpen);
    const unsubClose = eventBus.on(Events.TAB_CLOSE, handleTabClose);
    const unsubDiffClose = eventBus.on(Events.DIFF_TAB_CLOSE, handleTabClose);
    const unsubDirty = eventBus.on(Events.TAB_DIRTY, handleTabDirty);
    const unsubDiffUpdate = eventBus.on(Events.DIFF_TAB_UPDATE, handleDiffTabUpdate);

    return () => {
      unsubFileOpen();
      unsubDiffOpen();
      unsubClose();
      unsubDiffClose();
      unsubDirty();
      unsubDiffUpdate();
    };
  }, []);

  const emitTabChange = (tab: UnifiedTabInfo) => {
    if (tab.type === 'file') {
      eventBus.emit(Events.TAB_CHANGE, { id: tab.id, path: tab.path, type: 'file' });
    } else {
      eventBus.emit(Events.TAB_CHANGE, { id: tab.id, type: 'diff', tabInfo: tab });
    }
  };

  const handleTabClick = (id: string) => {
    setActiveTabId(id);
    const tab = tabs.find((t) => t.id === id);
    if (tab) {
      emitTabChange(tab);
    }
  };

  const handleTabCloseClick = (e: React.MouseEvent, tab: UnifiedTabInfo) => {
    e.stopPropagation();
    if (tab.type === 'diff') {
      eventBus.emit(Events.DIFF_TAB_CLOSE, { id: tab.id });
    } else {
      eventBus.emit(Events.TAB_CLOSE, { id: tab.id });
    }
  };

  const getTabDisplay = (tab: UnifiedTabInfo) => {
    if (tab.type === 'diff') {
      return {
        name: `Diff: ${tab.fileName}`,
        icon: 'git-compare' as const,
        isDirty: false,
      };
    }
    return {
      name: tab.name,
      icon: null,
      isDirty: tab.isDirty,
    };
  };

  return (
    <div className="h-tabbar min-h-tabbar bg-tertiary flex items-stretch overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:h-0">
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const display = getTabDisplay(tab);
          return (
            <div
              key={tab.id}
              className={cn(
                'group flex items-center gap-2 px-3 bg-tertiary border-r border-default cursor-pointer min-w-[100px] max-w-[220px] transition-colors duration-150 hover:bg-hover',
                activeTabId === tab.id && 'bg-primary border-b border-b-bg-primary -mb-px',
                tab.type === 'diff' && 'text-accent'
              )}
              onClick={() => handleTabClick(tab.id)}
            >
              {display.icon && (
                <Icon name={display.icon} size={14} className="flex-shrink-0" />
              )}
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm flex items-center gap-1">
                {display.isDirty && <span className="text-fg-secondary text-[8px]">●</span>}
                {display.name}
              </span>
              <IconButton
                icon="x"
                size="sm"
                variant="ghost"
                className="w-[18px] h-[18px] flex items-center justify-center rounded-sm text-sm text-fg-secondary opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleTabCloseClick(e, tab)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function useActiveTab() {
  const [activeTab, setActiveTab] = useState<UnifiedTabInfo | null>(null);

  useEffect(() => {
    const handleTabChange = (data: unknown) => {
      const tabData = data as { id: string; type: string; path?: string; tabInfo?: DiffTabInfo };
      if (tabData.type === 'diff' && tabData.tabInfo) {
        setActiveTab(tabData.tabInfo);
      } else if (tabData.type === 'file' && tabData.path) {
        setActiveTab({
          id: tabData.id,
          type: 'file',
          path: tabData.path,
          name: tabData.path.split('/').pop() || '',
          isDirty: false,
        });
      }
    };

    const handleTabClose = () => {
      setActiveTab(null);
    };

    const unsubChange = eventBus.on(Events.TAB_CHANGE, handleTabChange);
    const unsubClose = eventBus.on(Events.TAB_CLOSE, handleTabClose);
    const unsubDiffClose = eventBus.on(Events.DIFF_TAB_CLOSE, handleTabClose);

    return () => {
      unsubChange();
      unsubClose();
      unsubDiffClose();
    };
  }, []);

  return activeTab;
}
