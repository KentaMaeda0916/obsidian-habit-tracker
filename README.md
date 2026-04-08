# Habit Tracker for Obsidian

**[English](#english) | [日本語](#日本語) | [中文](#中文) | [Español](#español) | [한국어](#한국어)**

---

## English

A simple, focused habit tracker plugin for [Obsidian](https://obsidian.md). One tap to check off today's habits. Data is stored as plain Markdown files — fully compatible with [Dataview](https://github.com/blacksmithgu/obsidian-dataview).

### Features

- **One-tap check-in** — check or uncheck today's habits instantly
- **Streak tracking** — see your current consecutive days 🔥
- **Per-habit Markdown files** — each habit gets its own `.md` file with a built-in DataviewJS calendar
- **Auto-generated dashboard** — a summary dashboard (`habits/stats/dashboard.md`) is created on first launch
- **Dataview compatible** — query your habit data with any Dataview or DataviewJS block
- **Cross-platform** — sidebar panel on desktop, full-screen tab on iOS/mobile
- **No dependencies** — works without Dataview installed (Dataview only needed to render the calendar/dashboard views)

### Installation

#### From Community Plugins (recommended)
1. Open Obsidian Settings → Community Plugins
2. Search for **Habit Tracker**
3. Click Install, then Enable

#### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/KentaMaeda0916/obsidian-habit-tracker/releases/latest)
2. Copy them to your vault: `.obsidian/plugins/habit-tracker/`
3. Enable the plugin in Settings → Community Plugins

### Usage

1. The **Habit Tracker** panel opens automatically on launch (sidebar on desktop, tab on mobile)
2. Tap **+ 習慣を追加 / Add habit** to create a new habit
3. Tap a checkbox to toggle today's completion
4. Each habit file is created at `habits/tracker/<name>.md` with a DataviewJS calendar view
5. A summary dashboard is auto-generated at `habits/stats/dashboard.md`

### File Structure

```
habits/
├── tracker/
│   ├── Exercise.md     ← one file per habit (frontmatter + DataviewJS calendar)
│   └── Reading.md
└── stats/
    └── dashboard.md    ← auto-generated summary dashboard
```

### Habit File Format

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

### Dataview Query Examples

```dataview
TABLE habit, length(completions) AS Total
FROM "habits/tracker"
SORT length(completions) DESC
```

### Settings

| Setting | Description | Default |
|---|---|---|
| Habits folder | Path where habit files are stored | `habits/tracker` |

---

## 日本語

[Obsidian](https://obsidian.md) 向けのシンプルな習慣トラッカープラグインです。ワンタップで今日の習慣を記録。データはプレーンな Markdown ファイルとして保存され、[Dataview](https://github.com/blacksmithgu/obsidian-dataview) と完全に互換します。

### 機能

- **ワンタップチェックイン** — 今日の習慣を即座にチェック・解除
- **ストリーク表示** — 連続達成日数をリアルタイム表示 🔥
- **習慣ごとの Markdown ファイル** — 各習慣に DataviewJS カレンダー付きの `.md` ファイルを自動生成
- **ダッシュボードの自動生成** — 初回起動時にサマリーダッシュボード（`habits/stats/dashboard.md`）を作成
- **Dataview 対応** — Dataview / DataviewJS ブロックで習慣データをクエリ可能
- **クロスプラットフォーム** — デスクトップは右サイドバー、iOS/モバイルは全画面タブで表示
- **依存なし** — Dataview がなくても動作（カレンダー・ダッシュボードの表示には Dataview が必要）

### インストール

#### コミュニティプラグインから（推奨）
1. Obsidian の設定 → コミュニティプラグイン を開く
2. **Habit Tracker** を検索
3. インストール → 有効化

#### 手動インストール
1. [最新リリース](https://github.com/KentaMaeda0916/obsidian-habit-tracker/releases/latest) から `main.js`、`manifest.json`、`styles.css` をダウンロード
2. Vault の `.obsidian/plugins/habit-tracker/` にコピー
3. 設定 → コミュニティプラグイン で有効化

### 使い方

1. 起動時に **Habit Tracker** パネルが自動で開きます（デスクトップ: サイドバー、モバイル: タブ）
2. **+ 習慣を追加** ボタンで新しい習慣を作成
3. チェックボックスをタップして今日の達成をトグル
4. 習慣ファイルは `habits/tracker/<名前>.md` に作成されます（DataviewJS カレンダー付き）
5. サマリーダッシュボードが `habits/stats/dashboard.md` に自動生成されます

### ファイル構造

```
habits/
├── tracker/
│   ├── 運動.md         ← 習慣ごとのファイル（frontmatter + DataviewJS カレンダー）
│   └── 読書.md
└── stats/
    └── dashboard.md    ← 自動生成されるサマリーダッシュボード
```

### 習慣ファイルのフォーマット

```markdown
---
habit: "運動"
description: "30分"
created: 2026-01-01
completions:
  - 2026-04-07
  - 2026-04-08
---
```

### Dataview クエリ例

```dataview
TABLE habit, length(completions) AS 合計
FROM "habits/tracker"
SORT length(completions) DESC
```

### 設定

| 設定項目 | 説明 | デフォルト |
|---|---|---|
| 習慣ファイルのフォルダ | 習慣ファイルを保存するフォルダのパス | `habits/tracker` |

---

## 中文

适用于 [Obsidian](https://obsidian.md) 的简洁习惯追踪插件。一键记录今日习惯，数据以纯 Markdown 文件存储，完全兼容 [Dataview](https://github.com/blacksmithgu/obsidian-dataview)。

### 功能

- **一键打卡** — 即时勾选或取消今日习惯
- **连续记录** — 实时显示连续坚持天数 🔥
- **每个习惯独立文件** — 自动为每个习惯创建带有 DataviewJS 日历的 `.md` 文件
- **自动生成仪表盘** — 首次启动时自动创建汇总仪表盘（`habits/stats/dashboard.md`）
- **兼容 Dataview** — 可用 Dataview / DataviewJS 查询习惯数据
- **跨平台** — 桌面端显示为右侧边栏，iOS/移动端显示为全屏标签页
- **无需依赖** — 无需安装 Dataview 即可运行（日历/仪表盘视图需要 Dataview）

### 安装

#### 通过社区插件安装（推荐）
1. 打开 Obsidian 设置 → 社区插件
2. 搜索 **Habit Tracker**
3. 点击安装，然后启用

#### 手动安装
1. 从[最新发布页面](https://github.com/KentaMaeda0916/obsidian-habit-tracker/releases/latest)下载 `main.js`、`manifest.json`、`styles.css`
2. 复制到 `.obsidian/plugins/habit-tracker/`
3. 在设置 → 社区插件中启用

### 使用方法

1. 启动时 **Habit Tracker** 面板自动打开
2. 点击 **+ 添加习惯** 创建新习惯
3. 点击复选框切换今日完成状态
4. 习惯文件保存在 `habits/tracker/<名称>.md`
5. 汇总仪表盘自动生成于 `habits/stats/dashboard.md`

### 设置

| 设置项 | 说明 | 默认值 |
|---|---|---|
| 习惯文件夹 | 习惯文件的保存路径 | `habits/tracker` |

---

## Español

Un plugin de seguimiento de hábitos simple y enfocado para [Obsidian](https://obsidian.md). Un toque para registrar tus hábitos diarios. Los datos se guardan como archivos Markdown planos, totalmente compatibles con [Dataview](https://github.com/blacksmithgu/obsidian-dataview).

### Características

- **Check-in con un toque** — marca o desmarca los hábitos de hoy al instante
- **Racha de días** — visualiza tus días consecutivos en tiempo real 🔥
- **Archivo Markdown por hábito** — cada hábito genera su propio `.md` con un calendario DataviewJS integrado
- **Dashboard autogenerado** — al primer inicio se crea un resumen en `habits/stats/dashboard.md`
- **Compatible con Dataview** — consulta tus datos de hábitos con cualquier bloque Dataview o DataviewJS
- **Multiplataforma** — panel lateral en escritorio, pestaña a pantalla completa en iOS/móvil
- **Sin dependencias** — funciona sin Dataview instalado (Dataview necesario para el calendario y dashboard)

### Instalación

#### Desde Plugins de Comunidad (recomendado)
1. Abre Ajustes de Obsidian → Plugins de Comunidad
2. Busca **Habit Tracker**
3. Instala y activa

#### Instalación manual
1. Descarga `main.js`, `manifest.json` y `styles.css` desde la [última versión](https://github.com/KentaMaeda0616/obsidian-habit-tracker/releases/latest)
2. Cópialos a `.obsidian/plugins/habit-tracker/`
3. Actívalo en Ajustes → Plugins de Comunidad

### Ajustes

| Ajuste | Descripción | Valor por defecto |
|---|---|---|
| Carpeta de hábitos | Ruta donde se guardan los archivos de hábitos | `habits/tracker` |

---

## 한국어

[Obsidian](https://obsidian.md)을 위한 간단한 습관 트래커 플러그인입니다. 탭 한 번으로 오늘의 습관을 기록하세요. 데이터는 일반 Markdown 파일로 저장되며 [Dataview](https://github.com/blacksmithgu/obsidian-dataview)와 완벽하게 호환됩니다.

### 기능

- **원탭 체크인** — 오늘의 습관을 즉시 체크하거나 해제
- **연속 달성 표시** — 연속 달성 일수를 실시간으로 확인 🔥
- **습관별 Markdown 파일** — 각 습관마다 DataviewJS 달력이 포함된 `.md` 파일 자동 생성
- **대시보드 자동 생성** — 첫 실행 시 요약 대시보드(`habits/stats/dashboard.md`) 자동 생성
- **Dataview 호환** — Dataview / DataviewJS 블록으로 습관 데이터 쿼리 가능
- **크로스 플랫폼** — 데스크톱은 오른쪽 사이드바, iOS/모바일은 전체 화면 탭으로 표시
- **의존성 없음** — Dataview 없이도 동작 (달력/대시보드 렌더링에는 Dataview 필요)

### 설치

#### 커뮤니티 플러그인에서 설치 (권장)
1. Obsidian 설정 → 커뮤니티 플러그인 열기
2. **Habit Tracker** 검색
3. 설치 후 활성화

#### 수동 설치
1. [최신 릴리즈](https://github.com/KentaMaeda0916/obsidian-habit-tracker/releases/latest)에서 `main.js`, `manifest.json`, `styles.css` 다운로드
2. `.obsidian/plugins/habit-tracker/`에 복사
3. 설정 → 커뮤니티 플러그인에서 활성화

### 설정

| 설정 항목 | 설명 | 기본값 |
|---|---|---|
| 습관 파일 폴더 | 습관 파일을 저장할 폴더 경로 | `habits/tracker` |

---

## License

MIT © [maedakenta](https://github.com/maedakenta)
