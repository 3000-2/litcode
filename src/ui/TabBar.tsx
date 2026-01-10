import { useState, useEffect } from 'react';
import { eventBus, Events, type TabInfo } from '../core';
import './TabBar.css';

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
        setActiveTabId((currentActiveId) =>
          currentActiveId === id ? (newTabs[newTabs.length - 1]?.id ?? null) : currentActiveId
        );
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
  }, [activeTabId, tabs]);

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
    <div className="tabbar">
      <div className="tabbar-tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className={`tab-title ${tab.isDirty ? 'dirty' : ''}`}>
              {tab.isDirty && <span className="dirty-indicator">●</span>}
              {tab.name}
            </span>
            <button
              className="tab-close"
              onClick={(e) => handleTabCloseClick(e, tab.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
