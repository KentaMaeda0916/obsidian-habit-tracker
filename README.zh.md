# Habit Tracker for Obsidian

适用于 [Obsidian](https://obsidian.md) 的简洁习惯追踪插件。一键记录今日习惯，数据以纯 Markdown 文件存储，完全兼容 [Dataview](https://github.com/blacksmithgu/obsidian-dataview)。

**其他语言:** [English](README.md) | [日本語](README.ja.md) | [Español](README.es.md) | [한국어](README.ko.md)

---

## 功能

- **一键打卡** — 即时勾选或取消今日习惯
- **连续记录** — 实时显示连续坚持天数 🔥
- **每个习惯独立文件** — 自动为每个习惯创建带有 DataviewJS 日历的 `.md` 文件
- **自动生成仪表盘** — 首次启动时自动创建汇总仪表盘（`habits/stats/dashboard.md`）
- **兼容 Dataview** — 可用 Dataview / DataviewJS 查询习惯数据
- **跨平台** — 桌面端显示为右侧边栏，iOS/移动端显示为全屏标签页
- **无需依赖** — 无需安装 Dataview 即可运行（日历/仪表盘视图需要 Dataview）

## 安装

### 通过社区插件安装（推荐）
1. 打开 Obsidian 设置 → 社区插件
2. 搜索 **Habit Tracker**
3. 点击安装，然后启用

### 通过 BRAT 安装（测试版）
1. 从社区插件安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat)
2. 打开 BRAT 设置 → **Add Beta plugin**
3. 输入 `https://github.com/KentaMaeda0916/obsidian-habit-tracker`
4. 点击 **Add Plugin**，然后在设置 → 社区插件中启用

### 手动安装
1. 从[最新发布页面](https://github.com/KentaMaeda0616/obsidian-habit-tracker/releases/latest)下载 `main.js`、`manifest.json`、`styles.css`
2. 复制到 `.obsidian/plugins/habit-tracker/`
3. 在设置 → 社区插件中启用

## 使用方法

1. 启动时 **Habit Tracker** 面板自动打开（桌面端：侧边栏，移动端：全屏标签页）
2. 点击 **+ 添加习惯** 创建新习惯
3. 点击复选框切换今日完成状态
4. 习惯文件保存在 `habits/tracker/<名称>.md`（含 DataviewJS 日历）
5. 汇总仪表盘自动生成于 `habits/stats/dashboard.md`

## 文件结构

```
habits/
├── tracker/
│   ├── 运动.md         ← 每个习惯独立文件（frontmatter + DataviewJS 日历）
│   └── 阅读.md
└── stats/
    └── dashboard.md    ← 自动生成的汇总仪表盘
```

## 习惯文件格式

```markdown
---
habit: "运动"
description: "30分钟"
created: 2026-01-01
completions:
  - 2026-04-07
  - 2026-04-08
---
```

## Dataview 查询示例

```dataview
TABLE habit, length(completions) AS 总次数
FROM "habits/tracker"
SORT length(completions) DESC
```

## 设置

| 设置项 | 说明 | 默认值 |
|---|---|---|
| 习惯文件夹 | 习惯文件的保存路径 | `habits/tracker` |

## 许可证

MIT © [maedakenta](https://github.com/maedakenta)
