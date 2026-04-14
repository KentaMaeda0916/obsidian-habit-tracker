import { App, TFile, normalizePath } from "obsidian";
import HabitTrackerPlugin from "./main";

export interface Habit {
	name: string;        // ファイル名（ファイルシステム安全）
	displayName: string; // frontmatter habit: フィールド（表示用）
	description: string;
	created: string;
	completions: string[];
}

/** タイムゾーンに依存しないローカル日付文字列 YYYY-MM-DD を返す */
export function localDateString(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export function todayString(): string {
	return localDateString(new Date());
}

export class HabitStorage {
	private app: App;
	private plugin: HabitTrackerPlugin;

	constructor(plugin: HabitTrackerPlugin) {
		this.plugin = plugin;
		this.app = plugin.app;
	}

	private get folder(): string {
		return this.plugin.settings.habitsFolder;
	}

	/** tracker フォルダの兄弟として stats フォルダのパスを導出 */
	private get statsFolder(): string {
		const idx = this.folder.lastIndexOf("/");
		const parent = idx >= 0 ? this.folder.slice(0, idx) : "";
		return parent ? `${parent}/stats` : "stats";
	}

	private habitPath(name: string): string {
		return normalizePath(`${this.folder}/${name}.md`);
	}

	private async ensureFolder(): Promise<void> {
		if (!this.app.vault.getAbstractFileByPath(this.folder)) {
			await this.app.vault.createFolder(this.folder);
		}
	}

	private parseContent(content: string, name: string): Habit {
		const match = content.match(/^---\n([\s\S]*?)\n---/);
		if (!match) return { name, displayName: name, description: "", created: "", completions: [] };

		const yaml = match[1];

		const habitMatch = yaml.match(/^habit:\s*(.+)$/m);
		const displayName = habitMatch ? habitMatch[1].trim().replace(/^["']|["']$/g, "") : name;

		const descMatch = yaml.match(/^description:\s*(.*)$/m);
		const description = descMatch ? descMatch[1].trim().replace(/^["']|["']$/g, "") : "";

		const createdMatch = yaml.match(/^created:\s*(.+)$/m);
		const created = createdMatch ? createdMatch[1].trim() : "";

		const completions: string[] = [];
		const completionsBlock = yaml.match(/^completions:\n([\s\S]*?)(?=\n\S|$)/m);
		if (completionsBlock) {
			for (const line of completionsBlock[1].split("\n")) {
				const m = line.match(/^\s+-\s+(\d{4}-\d{2}-\d{2})$/);
				if (m) completions.push(m[1]);
			}
		}

		return { name, displayName, description, created, completions };
	}

	private buildFrontmatter(habit: Habit): string {
		const completionsList =
			habit.completions.length > 0
				? `completions:\n${habit.completions.map(d => `  - ${d}`).join("\n")}`
				: `completions: []`;
		const quote = (s: string) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
		return `---\nhabit: ${quote(habit.displayName)}\ndescription: ${quote(habit.description)}\ncreated: ${habit.created}\n${completionsList}\n---\n`;
	}

	private buildFullContent(habit: Habit): string {
		const frontmatter = this.buildFrontmatter(habit);
		const dataviewjs = `
\`\`\`dataviewjs
const page = dv.current();
const completions = new Set((page.completions || []).map(d => String(d).slice(0, 10)));
const total = completions.size;

// 連続記録を計算
const sorted = [...completions].sort((a, b) => b.localeCompare(a));
let streak = 0;
const today = new Date();
today.setHours(0, 0, 0, 0);
let cur = new Date(today);
for (const dateStr of sorted) {
  const d = new Date(dateStr + "T00:00:00");
  const diff = Math.round((cur - d) / 86400000);
  if (diff <= 1) { streak++; cur = d; } else break;
}

dv.paragraph(\`## \${page.habit}\${page.description ? ' (' + page.description + ')' : ''}\\n**合計 \${total}回** ｜ **連続 \${streak}日**\`);

// 当月カレンダー
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const firstDay = new Date(year, month, 1).getDay();
const daysInMonth = new Date(year, month + 1, 0).getDate();
const pad = (n) => String(n).padStart(2, '0');
const monthStr = \`\${year}-\${pad(month + 1)}\`;

let cal = \`**\${year}年\${month + 1}月**\\n\\n\`;
cal += \`| 日 | 月 | 火 | 水 | 木 | 金 | 土 |\\n|---|---|---|---|---|---|---|\\n\`;
let cells = Array(firstDay).fill('　');
for (let d = 1; d <= daysInMonth; d++) {
  const key = \`\${monthStr}-\${pad(d)}\`;
  cells.push(completions.has(key) ? \`✅\` : \`\${d}\`);
}
while (cells.length % 7 !== 0) cells.push('　');
for (let i = 0; i < cells.length; i += 7) {
  cal += \`| \${cells.slice(i, i + 7).join(' | ')} |\\n\`;
}
dv.paragraph(cal);

// 直近の記録
if (sorted.length > 0) {
  dv.paragraph('**最近の記録**');
  dv.table(['日付'], sorted.slice(0, 10).map(d => [d]));
}
\`\`\`
`;
		return frontmatter + dataviewjs;
	}

	/** frontmatter のみ置換し、本文（DataviewJS等）は保持する */
	private replaceFrontmatter(content: string, habit: Habit): string {
		const newFrontmatter = this.buildFrontmatter(habit);
		return content.replace(/^---\n[\s\S]*?\n---\n/, newFrontmatter);
	}

	async loadHabit(name: string): Promise<Habit | null> {
		const file = this.app.vault.getAbstractFileByPath(this.habitPath(name));
		if (!(file instanceof TFile)) return null;
		const content = await this.app.vault.read(file);
		return this.parseContent(content, name);
	}

	async saveHabit(habit: Habit): Promise<void> {
		await this.ensureFolder();
		const path = this.habitPath(habit.name);
		const file = this.app.vault.getAbstractFileByPath(path);
		if (file instanceof TFile) {
			const existing = await this.app.vault.read(file);
			await this.app.vault.modify(file, this.replaceFrontmatter(existing, habit));
		} else {
			await this.app.vault.create(path, this.buildFullContent(habit));
		}
	}

	async loadAllHabits(): Promise<Habit[]> {
		await this.ensureFolder();
		const files = this.app.vault
			.getFiles()
			.filter(f => f.parent?.path === this.folder && f.extension === "md");

		const habits = await Promise.all(
			files.map(async f => {
				const content = await this.app.vault.read(f);
				return this.parseContent(content, f.basename);
			})
		);

		return habits.sort((a, b) => a.created.localeCompare(b.created));
	}

	async createHabit(filename: string, displayName: string, description: string): Promise<void> {
		await this.saveHabit({
			name: filename,
			displayName,
			description,
			created: todayString(),
			completions: [],
		});
	}

	async deleteHabit(name: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(this.habitPath(name));
		if (file instanceof TFile) {
			await this.app.vault.delete(file);
		}
	}

	/** 指定日の完了状態を冪等にセットする */
	async setCompletion(habitName: string, date: string, completed: boolean): Promise<void> {
		const habit = await this.loadHabit(habitName);
		if (!habit) return;

		const hasDate = habit.completions.includes(date);
		if (completed === hasDate) return; // 既に希望状態なら no-op

		if (completed) {
			habit.completions.push(date);
			habit.completions.sort();
		} else {
			habit.completions = habit.completions.filter(d => d !== date);
		}
		await this.saveHabit(habit);
	}

	/** 指定日からの連続達成日数を計算（ローカルタイムゾーン基準） */
	calculateStreak(completions: string[], today: string): number {
		const set = new Set(completions);
		let streak = 0;
		// "T00:00:00" を付与することでローカルタイムとして解釈させる
		const date = new Date(today + "T00:00:00");

		while (set.has(localDateString(date))) {
			streak++;
			date.setDate(date.getDate() - 1);
		}

		return streak;
	}

	async ensureDashboard(): Promise<void> {
		const statsFolder = normalizePath(this.statsFolder);
		const dashboardPath = normalizePath(`${statsFolder}/dashboard.md`);

		if (this.app.vault.getAbstractFileByPath(dashboardPath)) return;

		if (!this.app.vault.getAbstractFileByPath(statsFolder)) {
			await this.app.vault.createFolder(statsFolder);
		}

		const trackerFolder = this.folder;
		const content = `---
title: Habit Dashboard
---

# 📊 Habit Dashboard

\`\`\`dataviewjs
const habits = dv.pages('"${trackerFolder}"');

const today = new Date();
today.setHours(0, 0, 0, 0);
const pad = (n) => String(n).padStart(2, '0');
const todayStr = \`\${today.getFullYear()}-\${pad(today.getMonth()+1)}-\${pad(today.getDate())}\`;

const rows = [];
for (const h of habits) {
  const completions = new Set((h.completions || []).map(d => String(d).slice(0, 10)));
  const total = completions.size;

  // 連続記録
  const sorted = [...completions].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  let cur = new Date(today);
  for (const dateStr of sorted) {
    const d = new Date(dateStr + "T00:00:00");
    const diff = Math.round((cur - d) / 86400000);
    if (diff <= 1) { streak++; cur = d; } else break;
  }

  // 今週の達成率
  const weekDates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    weekDates.push(\`\${d.getFullYear()}-\${pad(d.getMonth()+1)}-\${pad(d.getDate())}\`);
  }
  const weekDone = weekDates.filter(d => completions.has(d)).length;
  const weekBar = '🟩'.repeat(weekDone) + '⬜'.repeat(7 - weekDone);

  const doneToday = completions.has(todayStr) ? '✅' : '－';
  rows.push([h.habit || h.file.name, h.description || '', doneToday, \`\${streak}日\`, \`\${total}回\`, weekBar]);
}

dv.table(['習慣', '目標', '今日', '連続', '合計', '今週'], rows);
\`\`\`
`;

		await this.app.vault.create(dashboardPath, content);
	}
}
