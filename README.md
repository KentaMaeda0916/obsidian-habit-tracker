# Habit Tracker for Obsidian

A simple, focused habit tracker plugin for [Obsidian](https://obsidian.md). One tap to check off today's habits. Data is stored as plain Markdown files — fully compatible with [Dataview](https://github.com/blacksmithgu/obsidian-dataview).

**Read in:** [日本語](README.ja.md) | [中文](README.zh.md) | [Español](README.es.md) | [한국어](README.ko.md)

---

## Features

- **One-tap check-in** — check or uncheck today's habits instantly
- **Streak tracking** — see your current consecutive days 🔥
- **Per-habit Markdown files** — each habit gets its own `.md` file with a built-in DataviewJS calendar
- **Auto-generated dashboard** — a summary dashboard (`habits/stats/dashboard.md`) is created on first launch
- **Dataview compatible** — query your habit data with any Dataview or DataviewJS block
- **Cross-platform** — sidebar panel on desktop, full-screen tab on iOS/mobile
- **No dependencies** — works without Dataview installed (Dataview only needed to render the calendar/dashboard views)

## Installation

### From Community Plugins (recommended)
1. Open Obsidian Settings → Community Plugins
2. Search for **Habit Tracker**
3. Click Install, then Enable

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/KentaMaeda0916/obsidian-habit-tracker/releases/latest)
2. Copy them to your vault: `.obsidian/plugins/habit-tracker/`
3. Enable the plugin in Settings → Community Plugins

## Usage

1. The **Habit Tracker** panel opens automatically on launch (sidebar on desktop, tab on mobile)
2. Tap **+ Add habit** to create a new habit
3. Tap a checkbox to toggle today's completion
4. Each habit file is created at `habits/tracker/<name>.md` with a DataviewJS calendar view
5. A summary dashboard is auto-generated at `habits/stats/dashboard.md`

## File Structure

```
habits/
├── tracker/
│   ├── Exercise.md     ← one file per habit (frontmatter + DataviewJS calendar)
│   └── Reading.md
└── stats/
    └── dashboard.md    ← auto-generated summary dashboard
```

## Habit File Format

```markdown
---
habit: "Exercise"
description: "30 min"
created: 2026-01-01
completions:
  - 2026-04-07
  - 2026-04-08
---
```

## Dataview Query Examples

```dataview
TABLE habit, length(completions) AS Total
FROM "habits/tracker"
SORT length(completions) DESC
```

## Settings

| Setting | Description | Default |
|---|---|---|
| Habits folder | Path where habit files are stored | `habits/tracker` |

## License

MIT © [maedakenta](https://github.com/maedakenta)
