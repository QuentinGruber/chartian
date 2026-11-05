import {
	BasesPropertyId,
	BasesView,
	QueryController,
} from 'obsidian';
import { renderMermaid, showChartError } from './mermaid';

export class BarChartView extends BasesView {
	type = 'barchart-view';

	private containerEl: HTMLElement;

	constructor(controller: QueryController, scrollEl: HTMLElement) {
		super(controller);
		this.containerEl = scrollEl.createDiv({ cls: 'barchart-view' });
	}

	onDataUpdated(): void {
		void this.render();
	}

	private async render(): Promise<void> {
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

		const groupByProp = (
			this.config as { groupBy?: { property?: BasesPropertyId } }
		).groupBy?.property;
		const title = (
			groupByProp ? this.config.getDisplayName(groupByProp) : 'Chart'
		).replace(/"/g, "'");
		const maxValue = Math.max(...values, 1);
		const body = [
			`    title "${title}"`,
			`    x-axis [${labels.join(', ')}]`,
			`    y-axis "Entries" 0 --> ${maxValue}`,
			`    bar [${values.join(', ')}]`,
		];

		try {
			const source = ['xychart-beta', ...body].join('\n');
			await renderMermaid(this.containerEl, source);
		} catch (e) {
			showChartError(this.containerEl, e);
		}
	}
}
