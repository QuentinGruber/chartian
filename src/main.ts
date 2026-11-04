import { Plugin } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	MyPluginSettings,
	SampleSettingTab,
} from './settings';
import { PieChartView } from './piechart';
import { BarChartView } from './barchart';

export default class BaseChartsPlugin extends Plugin {
	settings!: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerBasesView('PieChart', {
			name: 'PieChart',
			icon: 'columns',
			factory: (controller, scrollEl) => {
				return new PieChartView(controller, scrollEl);
			},
		});

		this.registerBasesView('BarChart', {
			name: 'BarChart',
			icon: 'chart-column',
			factory: (controller, scrollEl) => {
				return new BarChartView(controller, scrollEl);
			},
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<MyPluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
