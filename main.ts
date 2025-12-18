import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import { getEncoding, TiktokenEncoding } from 'js-tiktoken';

interface TokenCounterSettings {
	modelEncoding: string;
}

const DEFAULT_SETTINGS: TokenCounterSettings = {
	modelEncoding: 'cl100k_base' // GPT-4, GPT-3.5-turbo
}

export default class TokenCounterPlugin extends Plugin {
	settings: TokenCounterSettings;
	statusBarItem: HTMLElement;
	debounceTimer: number | null = null;
	encoder: any;

	async onload() {
		await this.loadSettings();

		// Initialize encoder
		try {
			this.updateEncoder();
		} catch (e) {
			console.error("Failed to initialize encoder:", e);
		}

		// Cria o item na barra de status
		this.statusBarItem = this.addStatusBarItem();
		this.statusBarItem.classList.add('token-counter-status-item');
		this.statusBarItem.setText('0 tokens');

		// Evento: Quando o conteúdo do editor muda (com debounce)
		this.registerEvent(
			this.app.workspace.on('editor-change', (editor: Editor) => {
				this.debouncedUpdate();
			})
		);

		// Evento: Quando você troca de nota
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (leaf: WorkspaceLeaf) => {
				this.updateTokenCount();
			})
		);

		// Adiciona aba de configurações
		this.addSettingTab(new TokenCounterSettingTab(this.app, this));

		// Primeira execução
		this.updateTokenCount();
	}

	onunload() {
		// Limpeza se necessário
	}

	debouncedUpdate() {
		if (this.debounceTimer) {
			window.clearTimeout(this.debounceTimer);
		}
		this.debounceTimer = window.setTimeout(() => {
			this.updateTokenCount();
		}, 500); // 500ms de espera após parar de digitar
	}

	updateEncoder() {
		try {
			this.encoder = getEncoding(this.settings.modelEncoding as TiktokenEncoding);
		} catch (e) {
			console.error("Invalid encoding:", this.settings.modelEncoding);
			// Fallback to a safe default if user selected something invalid or old
			this.encoder = getEncoding("cl100k_base");
		}
	}

	updateTokenCount() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			const text = view.editor.getValue();
			
			// Lógica de contagem
			// Usa js-tiktoken se disponível, senão fallback
			const tokens = this.calculateTokens(text);
			
			this.statusBarItem.setText(`${this.formatNumber(tokens)} tokens`);
			this.statusBarItem.setAttr('title', `LLM Tokens (${this.settings.modelEncoding})`);
		} else {
			this.statusBarItem.setText('');
		}
	}

	calculateTokens(text: string): number {
		if (!text) return 0;
		
		if (this.encoder) {
			return this.encoder.encode(text).length;
		}

		// Fallback implementation
		return Math.ceil(text.length / 4);
	}

	formatNumber(num: number): string {
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'k';
		}
		return num.toString();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.updateEncoder();
		this.updateTokenCount();
	}
}

class TokenCounterSettingTab extends PluginSettingTab {
	plugin: TokenCounterPlugin;

	constructor(app: App, plugin: TokenCounterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Configurações do LLM Token Counter' });

		new Setting(containerEl)
			.setName('Encoding do Modelo')
			.setDesc('Escolha o algoritmo de tokenização (ex: cl100k_base para GPT-4)')
			.addDropdown(dropdown => dropdown
				.addOption('cl100k_base', 'GPT-4 / GPT-3.5')
				.addOption('p50k_base', 'Codex / Text-Davinci-002')
				.addOption('gpt2', 'GPT-2 / GPT-3')
				.setValue(this.plugin.settings.modelEncoding)
				.onChange(async (value) => {
					this.plugin.settings.modelEncoding = value;
					await this.plugin.saveSettings();
				}));
	}
}
