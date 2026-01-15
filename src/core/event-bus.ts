// Event bus for plugin communication

type EventCallback = (data: unknown) => void;

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: string, callback: EventCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, data?: unknown): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }

  once(event: string, callback: EventCallback): () => void {
    const wrapper: EventCallback = (data) => {
      this.off(event, wrapper);
      callback(data);
    };
    return this.on(event, wrapper);
  }

  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Event names constants
export const Events = {
  // File events
  FILE_OPEN: 'file:open',
  FILE_SAVE: 'file:save',
  FILE_CLOSE: 'file:close',
  FILE_CHANGE: 'file:change',
  FILE_CREATE: 'file:create',
  FILE_DELETE: 'file:delete',
  FILE_RENAME: 'file:rename',

  // Editor events
  EDITOR_FOCUS: 'editor:focus',
  EDITOR_BLUR: 'editor:blur',
  EDITOR_CURSOR_CHANGE: 'editor:cursor-change',
  EDITOR_SELECTION_CHANGE: 'editor:selection-change',

  // Tab events
  TAB_OPEN: 'tab:open',
  TAB_CLOSE: 'tab:close',
  TAB_CHANGE: 'tab:change',
  TAB_DIRTY: 'tab:dirty',

  // Sidebar events
  SIDEBAR_TOGGLE: 'sidebar:toggle',
  SIDEBAR_CHANGE: 'sidebar:change',

  // Git events
  GIT_STATUS_CHANGE: 'git:status-change',
  GIT_BRANCH_CHANGE: 'git:branch-change',
  GIT_REVERT: 'git:revert',

  // Debug events
  DEBUG_START: 'debug:start',
  DEBUG_STOP: 'debug:stop',
  DEBUG_BREAKPOINT_ADD: 'debug:breakpoint-add',
  DEBUG_BREAKPOINT_REMOVE: 'debug:breakpoint-remove',
  DEBUG_STEP: 'debug:step',
  DEBUG_PAUSE: 'debug:pause',
  DEBUG_CONTINUE: 'debug:continue',

  // Theme events
  THEME_CHANGE: 'theme:change',
  FONT_CHANGE: 'font:change',

  // Plugin events
  PLUGIN_ACTIVATE: 'plugin:activate',
  PLUGIN_DEACTIVATE: 'plugin:deactivate',

  // Diff view events
  DIFF_TAB_OPEN: 'diff:tab-open',
  DIFF_TAB_CLOSE: 'diff:tab-close',
  DIFF_TAB_UPDATE: 'diff:tab-update',
  DIFF_NAVIGATE_NEXT: 'diff:navigate-next',
  DIFF_NAVIGATE_PREV: 'diff:navigate-prev',
} as const;
