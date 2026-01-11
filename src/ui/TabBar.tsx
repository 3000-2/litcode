import { useState, useEffect } from 'react';
import { IconButton } from '../components';
import { cn } from '../lib/utils';
import { eventBus, Events, type TabInfo } from '../core';

export function TabBar() {
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  useEffect(() => {
    const handleTabOpen = (data: unknown) => {
      const { id, path, name } = data as { id: string; path: string; name: string };
      setTabs((prev) => {
        const exists = prev.find((t) => t.path === path);
        if (exists) {
          setActiveTabId(exists.id);
          return prev;
        }
        const newTab: TabInfo = { id, path, name, isDirty: false };
        setActiveTabId(id);
        return [...prev, newTab];
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
                eventBus.emit(Events.TAB_CHANGE, { id: newActiveTab.id, path: newActiveTab.path });
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
        prev.map((t) => (t.id === id ? { ...t, isDirty } : t))
      );
    };

    const unsubOpen = eventBus.on(Events.TAB_OPEN, handleTabOpen);
    const unsubClose = eventBus.on(Events.TAB_CLOSE, handleTabClose);
    const unsubDirty = eventBus.on(Events.TAB_DIRTY, handleTabDirty);

    return () => {
      unsubOpen();
      unsubClose();
      unsubDirty();
    };
  }, []);

  const handleTabClick = (id: string) => {
    setActiveTabId(id);
    const tab = tabs.find((t) => t.id === id);
    if (tab) {
      eventBus.emit(Events.TAB_CHANGE, { id, path: tab.path });
    }
  };

  const handleTabCloseClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    eventBus.emit(Events.TAB_CLOSE, { id });
  };

  return (
    <div className="h-tabbar min-h-tabbar bg-tertiary flex items-stretch overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:h-0">
      <div className="flex items-stretch">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              'group flex items-center gap-2 px-3 bg-tertiary border-r border-default cursor-pointer min-w-[100px] max-w-[200px] transition-colors duration-150 hover:bg-hover',
              activeTabId === tab.id && 'bg-primary border-b border-b-bg-primary -mb-px'
            )}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm flex items-center gap-1">
              {tab.isDirty && <span className="text-fg-secondary text-[8px]">●</span>}
              {tab.name}
            </span>
            <IconButton
              icon="x"
              size="sm"
              variant="ghost"
              className="w-[18px] h-[18px] flex items-center justify-center rounded-sm text-sm text-fg-secondary opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleTabCloseClick(e, tab.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
