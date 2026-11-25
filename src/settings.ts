import { App, PluginSettingTab, SettingDefinition } from 'obsidian';
import BaseChartsPlugin from './main';

export type MyPluginSettings = Record<string, unknown>;

export const DEFAULT_SETTINGS: MyPluginSettings = {};

export class ChartianSettingTab extends PluginSettingTab {
	plugin: BaseChartsPlugin;

	constructor(app: App, plugin: BaseChartsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinition[] {
		return [];
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
	}
}
