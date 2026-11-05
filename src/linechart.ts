import {
	BasesAllOptions,
	BasesEntry,
	BasesPropertyId,
	BasesView,
	BasesViewConfig,
	QueryController,
} from 'obsidian';
import { renderMermaid, showChartError } from './mermaid';

// Unwraps Bases Value objects ({ getValue() }) and wrappers like { data: 225 }
function unwrap(v: unknown): unknown {
	if (v != null && typeof v === 'object') {
		const getValue = (v as { getValue?: unknown }).getValue;
		if (typeof getValue === 'function') {
			return unwrap(getValue.call(v));
		}
		const data = (v as { data?: unknown }).data;
		if (data !== undefined) {
			return unwrap(data);
		}
	}
	return v;
}

function rawValue(entry: BasesEntry, prop: BasesPropertyId | null): unknown {
	if (!prop) return null;
	return unwrap(entry.getValue(prop));
}

function toNumber(v: unknown): number | null {
	const raw = unwrap(v);
	if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
	if (typeof raw === 'string') {
		const n = parseFloat(raw);
		return Number.isNaN(n) ? null : n;
	}
	return null;
}

function toLabel(v: unknown): string {
	if (typeof v === 'string') return v;
	if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint')
		return String(v);
	if (v == null) return 'Empty';
	if (v instanceof Date) return v.toISOString();
	if (typeof v === 'object') {
		// keep the value's own string form (e.g. date values); only fall back
		// to JSON when it would be the useless "[object Object]"
		// eslint-disable-next-line @typescript-eslint/no-base-to-string -- object values with a custom toString (e.g. dates) must keep their string form
		const s = String(v);
		return s === '[object Object]' ? (JSON.stringify(v) ?? 'Empty') : s;
	}
	return 'Empty';
}

function sortLabels(labels: string[]): string[] {
	const allNumeric = labels.every((l) => toNumber(l) !== null);
	if (allNumeric) {
		return labels.sort((a, b) => (toNumber(a) ?? 0) - (toNumber(b) ?? 0));
	}
	return labels.sort((a, b) => a.localeCompare(b));
}

function escapeLabel(label: string): string {
	return `"${label.replace(/"/g, "'")}"`;
}

export class LineChartView extends BasesView {
	type = 'lineChart-view';

	private containerEl: HTMLElement;

	static readonly getViewOptions = (
		_config: BasesViewConfig,
	): BasesAllOptions[] => [
		{
			displayName: 'X axis',
			type: 'property',
			key: 'xProperty',
			placeholder: 'Select property',
		},
		{
			displayName: 'X count',
			type: 'toggle',
			key: 'xCount',
			default: false,
		},
		{
			displayName: 'Y axis',
			type: 'property',
			key: 'yProperty',
			placeholder: 'Select property',
		},
		{
			displayName: 'Y count',
			type: 'toggle',
			key: 'yCount',
			default: false,
		},
		{
			displayName: 'Max X values (0 = auto)',
			type: 'slider',
			key: 'xMaxValue',
			default: 0,
			min: 0,
			step: 1,
		},
		{
			displayName: 'Max Y value (0 = auto)',
			type: 'slider',
			key: 'yMaxValue',
			default: 0,
			min: 0,
			step: 1,
		},
	];

	constructor(controller: QueryController, scrollEl: HTMLElement) {
		super(controller);
		this.containerEl = scrollEl.createDiv({ cls: 'linechart-view' });
	}

	onDataUpdated(): void {
		void this.render();
	}

	private async render(): Promise<void> {
		// ungrouped data comes back as a single group with an empty key,
		// which simply renders as one line
		const groups = this.data.groupedData;

		const xProp = this.config.getAsPropertyId('xProperty');
		if (!xProp) {
			this.containerEl.empty();
			this.containerEl.createEl('p', {
				text: 'Select an X axis property in the view options',
			});
			return;
		}
		const yProp = this.config.getAsPropertyId('yProperty');
		const xCount = Boolean(this.config.get('xCount'));
		const yCount = Boolean(this.config.get('yCount'));
		const xMaxValue = Math.max(
			0,
			Number(this.config.get('xMaxValue')) || 0,
		);
		const yMaxValue = Math.max(
			0,
			Number(this.config.get('yMaxValue')) || 0,
		);

		// count mode: count occurrences per X value instead of using property values
		const countMode = xCount || yCount || !yProp;

		const lineMaps: Map<string, number>[] = [];
		const lineNames: string[] = [];
		const totals = new Map<string, number>();
		for (const group of groups) {
			const map = new Map<string, number>();
			for (const entry of group.entries) {
				const label = toLabel(rawValue(entry, xProp));
				let y = 1;
				if (!countMode) {
					y = toNumber(rawValue(entry, yProp)) ?? 0;
				}
				map.set(label, (map.get(label) ?? 0) + y);
				totals.set(label, (totals.get(label) ?? 0) + y);
			}
			lineMaps.push(map);
			lineNames.push(group.hasKey() ? group.key!.toString() : 'All');
		}

		// X maxValue: keep the top N labels by total value, aggregate the rest into "Other"
		let labels = sortLabels([...totals.keys()]);
		if (xMaxValue > 0 && labels.length > xMaxValue) {
			const byTotal = [...totals.keys()].sort(
				(a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0),
			);
			const kept = new Set(byTotal.slice(0, xMaxValue));
			labels = sortLabels([...kept]);
			labels.push('Other');
			for (const map of lineMaps) {
				let other = 0;
				for (const [key, value] of [...map.entries()]) {
					if (!kept.has(key)) {
						other += value;
						map.delete(key);
					}
				}
				if (other > 0)
					map.set('Other', (map.get('Other') ?? 0) + other);
			}
		}

		const lines = lineMaps.map((map) =>
			labels.map((label) => map.get(label) ?? 0),
		);
		const allValues = lines.flat();
		const maxY = yMaxValue > 0 ? yMaxValue : Math.max(...allValues, 1);

		const xTitle = this.config.getDisplayName(xProp).replace(/"/g, "'");
		const yTitle =
			countMode || !yProp
				? 'Entries'
				: this.config.getDisplayName(yProp).replace(/"/g, "'");
		const groupByProp = (
			this.config as { groupBy?: { property?: BasesPropertyId } }
		).groupBy?.property;
		const groupSuffix = groupByProp
			? ` (${this.config.getDisplayName(groupByProp).replace(/"/g, "'")})`
			: '';
		const title =
			(countMode ? `Count by ${xTitle}` : `${yTitle} by ${xTitle}`) +
			groupSuffix;

		const body = [
			`    title "${title.replace(/"/g, "'")}"`,
			`    x-axis [${labels.map(escapeLabel).join(', ')}]`,
			`    y-axis "${yTitle}" 0 --> ${maxY}`,
			...lines.map(
				(values, i) =>
					`    line ${escapeLabel(lineNames[i] ?? 'line')} [${values.join(', ')}]`,
			),
		];

		try {
			const source = ['xychart-beta', ...body].join('\n');
			await renderMermaid(this.containerEl, source);
		} catch (e) {
			showChartError(this.containerEl, e);
		}
	}
}
