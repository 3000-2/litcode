import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';
import { StatusBar } from './StatusBar';
import { Editor } from '../plugins/editor/components/Editor';
import { pluginRegistry, type SidebarConfig } from '../core';
import { eventBus } from '../core/event-bus';

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<string | null>('file-explorer');
  const [sidebars, setSidebars] = useState<SidebarConfig[]>([]);

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

  const ActivePanel = sidebars.find((s) => s.id === activeSidebar)?.component;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="h-10 bg-primary titlebar-drag-region flex items-center justify-center">
        <span className="text-sm font-semibold text-fg-secondary select-none">Litcode</span>
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
            <Editor />
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
