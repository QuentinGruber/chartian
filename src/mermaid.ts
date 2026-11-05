import { loadMermaid } from 'obsidian';

interface MermaidApi {
	initialize(config: Record<string, unknown>): void;
	render(id: string, source: string): Promise<{ svg: string }>;
}

let renderCounter = 0;

export async function renderMermaid(
	containerEl: HTMLElement,
	source: string,
): Promise<void> {
	const mermaid = (await loadMermaid()) as MermaidApi;

	mermaid.initialize({
		startOnLoad: false,
		theme: document.body.hasClass('theme-dark') ? 'dark' : 'default',
	});

	const { svg } = await mermaid.render(`chartian-${++renderCounter}`, source);

	containerEl.empty();
	const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml');
	containerEl.appendChild(
		containerEl.ownerDocument.importNode(parsed.documentElement, true),
	);
}

export function showChartError(containerEl: HTMLElement, e: unknown): void {
	console.error(e);
	containerEl.empty();
	containerEl.createEl('p', { text: `Mermaid error ${String(e)}` });
}
