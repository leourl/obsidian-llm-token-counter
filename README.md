# Obsidian LLM Token Counter

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

A lightweight, performance-focused Obsidian plugin that displays the estimated token count for LLMs (like GPT-4, Claude, Gemini) in your status bar.

Designed to be unobtrusive and efficient, it helps you manage context windows before sending your notes to AI tools.

![Obsidian LLM Token Counter Demo](https://i.imgur.com/OLYzNFG.gif)

## ✨ Features

- **🚀 Zero Lag:** Uses a debounced update strategy (updates 500ms after you stop typing) to ensure your typing experience remains buttery smooth, even in large files.
- **📊 Real-time Status Bar:** Integrates seamlessly into the Obsidian footer alongside word count and backlinks.
- **⚙️ Configurable Models:** Switch between different tokenization strategies (GPT-4, GPT-3.5, Legacy).
- **🔋 Battery Friendly:** Only calculates when necessary.

## 📥 Installation

### Manual Installation
1. Download the `main.js`, `manifest.json`, and `styles.css` from the latest Release.
2. Create a folder named `obsidian-llm-token-counter` in your vault's `.obsidian/plugins/` directory.
3. Move the downloaded files into that folder.
4. Reload Obsidian and enable the plugin in Community Plugins settings.

### Development Build
1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to compile the plugin.
4. Copy the files to your plugin directory.

## 🛠️ Usage

Once enabled, look at the bottom right of your Obsidian window. You will see a counter like:
`1.2k tokens`

- **Hover** over the counter to see which model encoding is currently active.
- **Click** (future feature) to copy the count or open settings.

## 🧩 Roadmap

- [x] Basic Structure & Status Bar Integration
- [x] Debounce Logic for Performance
- [ ] Integration with `js-tiktoken` for 100% accurate GPT-4 counting
- [ ] Support for Claude (Anthropic) and Gemini (Google) tokenizers
- [ ] "Warning Threshold" setting (turn red when approaching 8k/32k tokens)

## 🤝 Contributing

Contributions are welcome! Please see `DOCUMENTATION.md` for technical details on how the plugin is architected.

## 📄 License

MIT License. See [LICENSE](LICENSE) for more information.
