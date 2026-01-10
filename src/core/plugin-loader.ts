// Plugin loader - Manages plugin lifecycle

import type { LitcodePlugin, PluginAPI } from './plugin-api';
import { createPluginAPI } from './plugin-api';
import { eventBus, Events } from './event-bus';

interface PluginState {
  plugin: LitcodePlugin;
  api: PluginAPI;
  isActive: boolean;
}

class PluginLoader {
  private plugins: Map<string, PluginState> = new Map();

  // Register a plugin (but don't activate yet)
  register(plugin: LitcodePlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin "${plugin.id}" is already registered`);
      return;
    }

    const api = createPluginAPI(plugin.id);
    this.plugins.set(plugin.id, {
      plugin,
      api,
      isActive: false,
    });

    console.log(`Plugin "${plugin.name}" (${plugin.id}) registered`);
  }

  // Activate a plugin
  async activate(pluginId: string): Promise<void> {
    const state = this.plugins.get(pluginId);
    if (!state) {
      console.error(`Plugin "${pluginId}" not found`);
      return;
    }

    if (state.isActive) {
      console.warn(`Plugin "${pluginId}" is already active`);
      return;
    }

    try {
      await state.plugin.activate(state.api);
      state.isActive = true;
      eventBus.emit(Events.PLUGIN_ACTIVATE, { pluginId });
      console.log(`Plugin "${state.plugin.name}" activated`);
    } catch (error) {
      console.error(`Failed to activate plugin "${pluginId}":`, error);
    }
  }

  // Deactivate a plugin
  async deactivate(pluginId: string): Promise<void> {
    const state = this.plugins.get(pluginId);
    if (!state) {
      console.error(`Plugin "${pluginId}" not found`);
      return;
    }

    if (!state.isActive) {
      console.warn(`Plugin "${pluginId}" is not active`);
      return;
    }

    try {
      await state.plugin.deactivate();
      state.isActive = false;
      eventBus.emit(Events.PLUGIN_DEACTIVATE, { pluginId });
      console.log(`Plugin "${state.plugin.name}" deactivated`);
    } catch (error) {
      console.error(`Failed to deactivate plugin "${pluginId}":`, error);
    }
  }

  // Activate all registered plugins
  async activateAll(): Promise<void> {
    for (const [pluginId] of this.plugins) {
      await this.activate(pluginId);
    }
  }

  // Deactivate all plugins
  async deactivateAll(): Promise<void> {
    for (const [pluginId, state] of this.plugins) {
      if (state.isActive) {
        await this.deactivate(pluginId);
      }
    }
  }

  // Get plugin by ID
  getPlugin(pluginId: string): LitcodePlugin | undefined {
    return this.plugins.get(pluginId)?.plugin;
  }

  // Check if plugin is active
  isActive(pluginId: string): boolean {
    return this.plugins.get(pluginId)?.isActive ?? false;
  }

  // Get all registered plugins
  getAllPlugins(): LitcodePlugin[] {
    return Array.from(this.plugins.values()).map((state) => state.plugin);
  }

  // Get all active plugins
  getActivePlugins(): LitcodePlugin[] {
    return Array.from(this.plugins.values())
      .filter((state) => state.isActive)
      .map((state) => state.plugin);
  }
}

// Singleton instance
export const pluginLoader = new PluginLoader();
