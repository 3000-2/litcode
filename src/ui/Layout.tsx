import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TabBar, useActiveTab } from './TabBar';
import { StatusBar } from './StatusBar';
import { Editor } from '../plugins/editor/components/Editor';
import { SplitDiffView } from '../plugins/git-diff/components/SplitDiffView';
import { pluginRegistry, type SidebarConfig } from '../core';
import { eventBus, Events } from '../core/event-bus';
import type { DiffTabInfo } from '../core/types';

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<string | null>('file-explorer');
  const [sidebars, setSidebars] = useState<SidebarConfig[]>([]);
  const activeTab = useActiveTab();

  useEffect(() => {
    setSidebars(pluginRegistry.getSidebars());

    const unsubscribe = eventBus.on('registry:sidebar-change', (data) => {
      setSidebars(data as SidebarConfig[]);
    });

    return () => unsubscribe();
  }, []);

  const handleSidebarToggle = (id: string) => {
    if (activeSidebar === id) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setActiveSidebar(id);
      setSidebarCollapsed(false);
    }
  };

  const handleDiffClose = () => {
    if (activeTab?.type === 'diff') {
      eventBus.emit(Events.DIFF_TAB_CLOSE, { id: activeTab.id });
    }
  };

  const handleDiffContentChange = (newContent: string) => {
    if (activeTab?.type === 'diff') {
      eventBus.emit(Events.DIFF_TAB_UPDATE, { 
        id: activeTab.id, 
        modifiedContent: newContent 
      });
    }
  };

  const ActivePanel = sidebars.find((s) => s.id === activeSidebar)?.component;
  const isDiffView = activeTab?.type === 'diff';

  return (
    <div className="flex flex-col h-full w-full">
      <div 
        data-tauri-drag-region
        className="h-10 bg-primary flex items-center justify-center select-none"
      >
        <span className="text-sm font-semibold text-fg-secondary pointer-events-none">Litcode</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          items={sidebars}
          activeId={activeSidebar}
          collapsed={sidebarCollapsed}
          onItemClick={handleSidebarToggle}
          onCollapseToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {!sidebarCollapsed && ActivePanel && (
          <div className="w-sidebar-expanded min-w-sidebar-expanded bg-secondary border-r border-default overflow-hidden flex flex-col">
            <ActivePanel />
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TabBar />
          <div className="flex-1 overflow-hidden relative" id="editor-container">
            {isDiffView ? (
              <SplitDiffView
                tabInfo={activeTab as DiffTabInfo}
                onClose={handleDiffClose}
                onContentChange={handleDiffContentChange}
              />
            ) : (
              <Editor />
            )}
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
