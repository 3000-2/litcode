import { useState, useEffect } from 'react';
import { pluginRegistry, type StatusBarItem } from '../core';
import { eventBus } from '../core/event-bus';

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
    <div className="h-statusbar min-h-statusbar bg-tertiary grid grid-cols-3 items-center px-2 text-sm text-fg-secondary">
      <div className="flex items-center gap-3 justify-start">
        {leftItems.map((item) => (
          <div key={item.id} className="flex items-center gap-1 cursor-default">
            {item.content}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 justify-center">
        {centerItems.map((item) => (
          <div key={item.id} className="flex items-center gap-1 cursor-default">
            {item.content}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 justify-end">
        {rightItems.map((item) => (
          <div key={item.id} className="flex items-center gap-1 cursor-default [&_button]:px-1.5 [&_button]:py-0.5 [&_button]:rounded-sm [&_button]:text-fg-secondary [&_button:hover]:bg-hover">
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
