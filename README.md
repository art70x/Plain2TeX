# Plain2TeX

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/art70x/Plain2TeX/blob/main/LICENSE)

> Convert plain-text math expressions to professionally typeset LaTeX instantly. Export as PNG, SVG, or copy LaTeX with one click—all in your browser.

🌐 **Try it live:** [https://plain2tex.vercel.app](https://plain2tex.vercel.app)

## 🚀 Key Features

**Core Features**

- **Instant LaTeX Conversion**: Type plain math expressions and see them rendered live.
- **Export Options**: Copy LaTeX, export as PNG or SVG with a single click.
- **Live Preview**: WYSIWYG preview with proper formatting and scaling.
- **Responsive UI**: Works seamlessly on desktop and mobile; side-by-side editor + preview or tab-based layout.
- **Privacy-First**: 100% client-side; your data never leaves your browser.
- **Keyboard Shortcuts / Hotkeys**: Perform common actions faster without leaving the keyboard.

**Advanced Features**

- **Customizable Settings**: Adjust rendering, font size, and theme via settings panel.
- **PWA Support**: Installable and works offline.
- **Lightweight & Fast**: Minimal dependencies for snappy performance.
- **Accessibility Friendly**: Keyboard navigation and screen-reader compatible.

## ⌨️ Keyboard Shortcuts / Hotkeys

| Shortcut      | Action        |
| ------------- | ------------- |
| `Mod+Shift+C` | Copy LaTeX    |
| `Mod+Shift+P` | Export PNG    |
| `Mod+Shift+S` | Export SVG    |
| `Mod+K`       | Focus input   |
| `Mod+/`       | Open help     |
| `Shift+S`     | Open Settings |

> **Note:** `Mod` = Ctrl (Windows/Linux) or Cmd (Mac)

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui + [Animate UI](https://animate-ui.com)
- **Icons**: Lucide React
- **PWA Support**: Vite Plugin PWA
- **Build Tool**: Vite 8
- **Code Quality**: ESLint + Prettier

## ⚡ Quick Start

### Prerequisites

- Node.js 20+
- pnpm 7+ (install with `npm i -g pnpm` if needed)

### Installation

```bash
# Clone the repository
git clone https://github.com/art70x/Plain2TeX.git

# Navigate to the project folder
cd Plain2TeX

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The app will run at: [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build production version
pnpm build

# Preview production build
pnpm preview
```

## 🤝 Contributing

We welcome contributions! Open issues, suggest features, or submit pull requests. See [CONTRIBUTING.md](https://github.com/art70x/Plain2TeX/blob/main/CONTRIBUTING.md) for detailed guidelines.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) – Accessible and customizable UI component library.
- [Animate UI](https://animate-ui.com/) – Accessible, customizable, and performance‑focused animated component library for modern web interfaces.
- [TanStack Hotkeys](https://github.com/TanStack/hotkeys) – Type‑safe, cross‑platform keyboard shortcut management library.
- [KaTeX](https://github.com/KaTeX/KaTeX) – Fast JavaScript library for rendering LaTeX‑style mathematical notation in browsers.
- [html-to-image](https://github.com/bubkoo/html-to-image) – Lightweight JavaScript utility that converts DOM nodes into images (SVG/PNG/JPEG) using HTML5 canvas and SVG serialization.
- [Lucide React](https://lucide.dev/) – Consistent, lightweight icon set used throughout the interface.
- [Vuetrix](https://github.com/art70x/Vuetrix) – Inspired the project’s architecture, CI workflow, formatting standards, and Vite configuration.
- [Lovable](https://lovable.dev/) – Used to build the first version of this app.

<p align="center">
  Made with ❤️ for students and the math community
</p>
