import { App, PluginSettingTab, Setting } from 'obsidian';
import BaseChartsPlugin from './main';

export interface MyPluginSettings {}

export const DEFAULT_SETTINGS: MyPluginSettings = {};

export class SampleSettingTab extends PluginSettingTab {
	plugin: BaseChartsPlugin;

	constructor(app: App, plugin: BaseChartsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
	}
}
