# Technical Documentation: LLM Token Counter

This document outlines the architecture, design choices, and development guidelines for the `obsidian-llm-token-counter` plugin.

## 🏗️ Architecture

The plugin follows a standard Obsidian plugin architecture using TypeScript. It is designed to be **event-driven** rather than polling-based to minimize resource usage.

### Core Components

1.  **`main.ts`**: The entry point.
    *   **`onload()`**: Registers event listeners and initializes the UI.
    *   **`updateTokenCount()`**: The core logic that retrieves text and calculates tokens.
    *   **`TokenCounterSettingTab`**: Handles user configuration.

2.  **Event Listeners**:
    We listen to two specific workspace events:
    *   `active-leaf-change`: Triggered when the user switches tabs or opens a new file. Updates immediately.
    *   `editor-change`: Triggered when the user types. **Crucial:** This is debounced.

### ⚡ Performance Strategy: The Debounce Pattern

Calculating tokens (especially with exact tokenizers like BPE) can be CPU intensive on large files (e.g., 10k+ words). Running this calculation on every keystroke (`editor-change`) would freeze the UI.

**Solution:** We implement a **500ms Debounce**.

```typescript
debouncedUpdate() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.updateTokenCount(), 500);
}
```

*   **Behavior:** The counter *stops* updating while the user is typing furiously. It only recalculates 0.5 seconds *after* the last keystroke.
*   **Benefit:** Zero input lag, regardless of file size.

## 🧮 Tokenization Logic

### Current Implementation (MVP)
Currently, the plugin uses a heuristic approximation for speed and zero-dependency weight:
`Tokens ≈ Character Count / 4`

### Future Implementation (v1.1)
The project is set up to integrate `js-tiktoken`.
*   **Why tiktoken?** It's the official OpenAI tokenizer implementation in JS.
*   **Trade-off:** It adds ~200kb to the bundle size (WASM/Dictionary).
*   **Implementation Plan:**
    1. Import `get_encoding` from `js-tiktoken`.
    2. Cache the encoder instance (do not re-instantiate on every keypress).
    3. Use `encoder.encode(text).length`.

## 🎨 UI/UX Guidelines

*   **Status Bar:** The item must have the class `token-counter-status-item`.
*   **Format:**
    *   `< 1000`: Display exact number (e.g., `450 tokens`).
    *   `> 1000`: Display in 'k' format (e.g., `1.2k tokens`) to save space.
*   **Tooltip:** The status bar item must have a `title` attribute showing the currently selected model (e.g., "Model: GPT-4").

## 📦 Build & Release Pipeline

The project uses `esbuild` for bundling.

1.  **Development:**
    `npm run dev` -> Watches file changes and rebuilds `main.js` instantly.
2.  **Production:**
    `npm run build` -> Minifies the code and removes sourcemaps for a smaller footprint.

### Publishing to Obsidian Community
To publish this plugin officially:
1.  Push code to GitHub.
2.  Create a GitHub Release with tags (e.g., `1.0.0`).
3.  Upload `main.js`, `manifest.json`, and `styles.css` as binary assets to the release.
4.  Submit a PR to the official `obsidian-releases` repository.

## 🧪 Testing

*   **Manual Testing:**
    *   Open a large file (10k words). Type fast. Verify no lag.
    *   Switch tabs. Verify counter updates instantly.
    *   Empty file. Verify counter shows "0 tokens".
