import {
	BasesPropertyId,
	BasesView,
	QueryController,
} from 'obsidian';
import { renderMermaid, showChartError } from './mermaid';

export class PieChartView extends BasesView {
	type = 'piechart-view';

	private containerEl: HTMLElement;

	constructor(controller: QueryController, scrollEl: HTMLElement) {
		super(controller);
		this.containerEl = scrollEl.createDiv({ cls: 'piechart-view' });
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

		const lines = groups.map((group) => {
			const label = group.hasKey() ? group.key!.toString() : 'Empty';
			return `  "${label.replace(/"/g, "'")}" : ${group.entries.length}`;
		});
		const groupByProp = (
			this.config as { groupBy?: { property?: BasesPropertyId } }
		).groupBy?.property;
		const title = (
			groupByProp ? this.config.getDisplayName(groupByProp) : 'Chart'
		).replace(/"/g, "'");
		const source = [`pie title "${title}"`, ...lines].join('\n');

		try {
			await renderMermaid(this.containerEl, source);
		} catch (e) {
			showChartError(this.containerEl, e);
		}
	}
}
