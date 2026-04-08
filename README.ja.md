# Habit Tracker for Obsidian

[Obsidian](https://obsidian.md) 向けのシンプルな習慣トラッカープラグインです。ワンタップで今日の習慣を記録。データはプレーンな Markdown ファイルとして保存され、[Dataview](https://github.com/blacksmithgu/obsidian-dataview) と完全に互換します。

**他の言語:** [English](README.md) | [中文](README.zh.md) | [Español](README.es.md) | [한국어](README.ko.md)

---

## 機能

- **ワンタップチェックイン** — 今日の習慣を即座にチェック・解除
- **ストリーク表示** — 連続達成日数をリアルタイム表示 🔥
- **習慣ごとの Markdown ファイル** — 各習慣に DataviewJS カレンダー付きの `.md` ファイルを自動生成
- **ダッシュボードの自動生成** — 初回起動時にサマリーダッシュボード（`habits/stats/dashboard.md`）を作成
- **Dataview 対応** — Dataview / DataviewJS ブロックで習慣データをクエリ可能
- **クロスプラットフォーム** — デスクトップは右サイドバー、iOS/モバイルは全画面タブで表示
- **依存なし** — Dataview がなくても動作（カレンダー・ダッシュボードの表示には Dataview が必要）

## インストール

### コミュニティプラグインから（推奨）
1. Obsidian の設定 → コミュニティプラグイン を開く
2. **Habit Tracker** を検索
3. インストール → 有効化

### BRAT 経由（ベータテスト用）
1. コミュニティプラグインから [BRAT](https://github.com/TfTHacker/obsidian42-brat) をインストール
2. BRAT の設定 → **Add Beta plugin** をクリック
3. `https://github.com/KentaMaeda0616/obsidian-habit-tracker` を入力
4. **Add Plugin** をクリックし、設定 → コミュニティプラグイン で有効化

### 手動インストール
1. [最新リリース](https://github.com/KentaMaeda0916/obsidian-habit-tracker/releases/latest) から `main.js`、`manifest.json`、`styles.css` をダウンロード
2. Vault の `.obsidian/plugins/habit-tracker/` にコピー
3. 設定 → コミュニティプラグイン で有効化

## 使い方

1. 起動時に **Habit Tracker** パネルが自動で開きます（デスクトップ: サイドバー、モバイル: タブ）
2. **+ 習慣を追加** ボタンで新しい習慣を作成
3. チェックボックスをタップして今日の達成をトグル
4. 習慣ファイルは `habits/tracker/<名前>.md` に作成されます（DataviewJS カレンダー付き）
5. サマリーダッシュボードが `habits/stats/dashboard.md` に自動生成されます

## ファイル構造

```
habits/
├── tracker/
│   ├── 運動.md         ← 習慣ごとのファイル（frontmatter + DataviewJS カレンダー）
│   └── 読書.md
└── stats/
    └── dashboard.md    ← 自動生成されるサマリーダッシュボード
```

## 習慣ファイルのフォーマット

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

## Dataview クエリ例

```dataview
TABLE habit, length(completions) AS 合計
FROM "habits/tracker"
SORT length(completions) DESC
```

## 設定

| 設定項目 | 説明 | デフォルト |
|---|---|---|
| 習慣ファイルのフォルダ | 習慣ファイルを保存するフォルダのパス | `habits/tracker` |

## ライセンス

MIT © [maedakenta](https://github.com/maedakenta)
