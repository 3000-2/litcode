import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';
import { StatusBar } from './StatusBar';
import { pluginRegistry, type SidebarConfig } from '../core';
import { eventBus } from '../core/event-bus';
import './Layout.css';

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
    <div className="layout">
      <div className="layout-main">
        <Sidebar
          items={sidebars}
          activeId={activeSidebar}
          collapsed={sidebarCollapsed}
          onItemClick={handleSidebarToggle}
          onCollapseToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {!sidebarCollapsed && ActivePanel && (
          <div className="sidebar-panel">
            <ActivePanel />
          </div>
        )}

        <div className="editor-area">
          <TabBar />
          <div className="editor-content" id="editor-container">
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
