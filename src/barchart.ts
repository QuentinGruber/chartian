import { BasesView, QueryController, loadMermaid } from 'obsidian';

export class BarChartView extends BasesView {
	type = 'barchart-view';

	private containerEl: HTMLElement;
	constructor(controller: QueryController, scrollEl: HTMLElement) {
		super(controller);
		this.containerEl = scrollEl.createDiv({ cls: 'barchart-view' });
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

		const labels: string[] = [];
		const values: number[] = [];
		for (const group of groups) {
			const label = group.hasKey() ? group.key!.toString() : 'Empty';
			labels.push(`"${label.replace(/"/g, "'")}"`);
			values.push(group.entries.length);
		}

		const config = this.config as any;
		const title = this.config
			.getDisplayName(config.groupBy.property)
			.replace(/"/g, "'");
		const maxValue = Math.max(...values, 1);
		const body = [
			`    title "${title}"`,
			`    x-axis [${labels.join(', ')}]`,
			`    y-axis "Entries" 0 --> ${maxValue}`,
			`    bar [${values.join(', ')}]`,
		];

		try {
			const mermaid = await loadMermaid();

			mermaid.initialize({
				startOnLoad: false,
				theme: document.body.hasClass('theme-dark')
					? 'dark'
					: 'default',
			});

			const source = ['xychart-beta', ...body].join('\n');
			const { svg } = await mermaid.render(`barchart`, source);

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
