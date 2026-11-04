import {
	Editor,
	MarkdownView,
	MarkdownFileInfo,
	Modal,
	Notice,
	Plugin,
	BasesView,
	QueryController,
	MarkdownRenderer,
	loadMermaid,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	MyPluginSettings,
	SampleSettingTab,
} from './settings';

export class PieChartView extends BasesView {
	type = 'piechart-view';

	private containerEl: HTMLElement;
	constructor(controller: QueryController, scrollEl: HTMLElement) {
		super(controller);
		this.containerEl = scrollEl.createDiv({ cls: 'piechart-view' });
	}

	async onDataUpdated(): Promise<void> {
		const groups = this.data.groupedData;

		if (!groups.some((g) => g.hasKey())) {
			this.containerEl.empty();
			this.containerEl.createEl('p', {
				text: 'You need to group your data for this chart',
			});
			return;
		}

		const lines = groups.map((group) => {
			const label = group.hasKey() ? group.key!.toString() : 'Empty';
			return `  "${label.replace(/"/g, "'")}" : ${group.entries.length}`;
		});
		const config = this.config as any;
		const title = this.config.getDisplayName(config.groupBy.property);
		const source = [`pie title ${title}`, ...lines].join('\n');

		try {
			const mermaid = await loadMermaid();

			mermaid.initialize({
				startOnLoad: false,
				theme: document.body.hasClass('theme-dark')
					? 'dark'
					: 'default',
			});

			const { svg } = await mermaid.render(`piechart`, source);

			this.containerEl.empty();
			this.containerEl.insertAdjacentHTML('beforeend', svg);
		} catch (e) {
			console.error(e);
			this.containerEl.empty();
			this.containerEl.createEl('p', {
				text: `Mermaid error ${e}`,
			});
		}
	}
}

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
