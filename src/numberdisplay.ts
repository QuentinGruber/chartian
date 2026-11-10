import {
	BasesAllOptions,
	BasesView,
	BasesViewConfig,
	QueryController,
} from 'obsidian';

export class NumberDisplayView extends BasesView {
	type = 'numberdisplay-view';

	static readonly getViewOptions = (
		_config: BasesViewConfig,
	): BasesAllOptions[] => [
		{
			displayName: 'Label',
			type: 'text',
			key: 'label',
			placeholder: 'e.g. notes',
		},
	];

	private containerEl: HTMLElement;

	constructor(controller: QueryController, scrollEl: HTMLElement) {
		super(controller);
		this.containerEl = scrollEl.createDiv({ cls: 'numberdisplay-view' });
	}

	onDataUpdated(): void {
		this.render();
	}

	private render(): void {
		const count = this.data.data.length;

		this.containerEl.empty();
		const rawLabel = this.config.get('label');
		const label = typeof rawLabel === 'string' ? rawLabel.trim() : '';
		if (label) {
			this.containerEl.createDiv({
				cls: 'numberdisplay-label',
				text: label,
			});
		}
		this.containerEl.createDiv({
			cls: 'numberdisplay-count',
			text: String(count),
		});
	}
}
