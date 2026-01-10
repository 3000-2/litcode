import { useState, useEffect } from 'react';
import { pluginRegistry, type StatusBarItem } from '../core';
import { eventBus } from '../core/event-bus';
import './StatusBar.css';

export function StatusBar() {
  const [items, setItems] = useState<StatusBarItem[]>([]);

  useEffect(() => {
    setItems(pluginRegistry.getStatusBarItems());

    const unsubscribe = eventBus.on('registry:statusbar-change', (data) => {
      setItems(data as StatusBarItem[]);
    });

    return () => unsubscribe();
  }, []);

  const leftItems = items.filter((i) => i.position === 'left');
  const centerItems = items.filter((i) => i.position === 'center');
  const rightItems = items.filter((i) => i.position === 'right');

  return (
    <div className="statusbar">
      <div className="statusbar-left">
        {leftItems.map((item) => (
          <div key={item.id} className="statusbar-item">
            {item.content}
          </div>
        ))}
      </div>

      <div className="statusbar-center">
        {centerItems.map((item) => (
          <div key={item.id} className="statusbar-item">
            {item.content}
          </div>
        ))}
      </div>

      <div className="statusbar-right">
        {rightItems.map((item) => (
          <div key={item.id} className="statusbar-item">
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
