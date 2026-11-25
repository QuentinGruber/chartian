# Chartian

**Chartian** is an Obsidian plugin that adds chart visualization views to the **Bases** plugin. It allows you to visualize your database data as pie charts, bar charts, line charts, and number displays directly within your bases.

## Features

- **Pie Chart View** - Visualize data distribution as a pie chart
- **Bar Chart View** - Compare values across categories with bar charts
- **Line Chart View** - Track trends over time or ordered data with line charts
- **Number Display View** - Highlight key metrics with large, readable numbers

All charts are rendered using **Mermaid.js** and support dark/light theme automatically.

## Requirements

- **Obsidian Bases plugin** must be installed and enabled
- Obsidian v1.10.0 or higher

## Installation

### From Community Plugins (Coming Soon)

1. Open Obsidian
2. Go to **Settings → Community plugins → Browse**
3. Search for "Chartian"
4. Click **Install** and then **Enable**

### Manual Installation

1. Download the latest release from GitHub
2. Extract `main.js`, `manifest.json`, and `styles.css` to:

    ```
    VaultFolder/.obsidian/plugins/chartian/
    ```

3. Reload Obsidian and enable Chartian in **Settings → Community plugins**

## Usage

1. Open or create a **Base** in Obsidian
2. Click the **"+" button** to add a new view
3. Select one of the Chartian view types:
    - **PieChart** - For categorical distribution
    - **BarChart** - For comparing values across groups
    - **LineChart** - For time-series or ordered data
    - **NumberDisplay** - For highlighting key metrics

### Configuration

Each view type supports different configuration options:

- **Group By** - Select which property to group data by (required for charts)
- **Chart Title** - Customize the chart title

## Development

### Prerequisites

- Node.js v18+
- npm
- Obsidian with Bases plugin installed

### Setup

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

Watches for changes and rebuilds automatically.

### Production Build

```bash
npm run build
```

### Linting

```bash
npm run lint
```
