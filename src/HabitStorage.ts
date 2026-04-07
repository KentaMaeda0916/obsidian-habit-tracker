import { App, TFile, normalizePath } from "obsidian";
import HabitTrackerPlugin from "./main";

export interface Habit {
	name: string;
	description: string;
	created: string;
	completions: string[];
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
		if (!match) return { name, description: "", created: "", completions: [] };

		const yaml = match[1];

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

		return { name, description, created, completions };
	}

	private toContent(habit: Habit): string {
		const completionsList =
			habit.completions.length > 0
				? `completions:\n${habit.completions.map(d => `  - ${d}`).join("\n")}`
				: `completions: []`;

		const desc = habit.description ? `"${habit.description.replace(/"/g, '\\"')}"` : '""';

		return `---\nhabit: ${habit.name}\ndescription: ${desc}\ncreated: ${habit.created}\n${completionsList}\n---\n`;
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
		const content = this.toContent(habit);
		const file = this.app.vault.getAbstractFileByPath(path);
		if (file instanceof TFile) {
			await this.app.vault.modify(file, content);
		} else {
			await this.app.vault.create(path, content);
		}
	}

	async loadAllHabits(): Promise<Habit[]> {
		await this.ensureFolder();
		const files = this.app.vault
			.getFiles()
			.filter(f => f.path.startsWith(this.folder + "/") && f.extension === "md");

		const habits: Habit[] = await Promise.all(
			files.map(async f => {
				const content = await this.app.vault.read(f);
				return this.parseContent(content, f.basename);
			})
		);

		return habits.sort((a, b) => a.created.localeCompare(b.created));
	}

	async createHabit(name: string, description: string): Promise<void> {
		const today = new Date().toISOString().split("T")[0];
		await this.saveHabit({ name, description, created: today, completions: [] });
	}

	async deleteHabit(name: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(this.habitPath(name));
		if (file instanceof TFile) {
			await this.app.vault.delete(file);
		}
	}

	/** チェックのトグル。完了済みなら解除、未完了なら追加。新しい状態（true=完了）を返す */
	async toggleCompletion(habitName: string, date: string): Promise<boolean> {
		const habit = await this.loadHabit(habitName);
		if (!habit) return false;

		const idx = habit.completions.indexOf(date);
		if (idx >= 0) {
			habit.completions.splice(idx, 1);
		} else {
			habit.completions.push(date);
			habit.completions.sort();
		}

		await this.saveHabit(habit);
		return idx < 0;
	}

	/** 指定日からの連続達成日数を計算 */
	calculateStreak(completions: string[], today: string): number {
		const set = new Set(completions);
		let streak = 0;
		const date = new Date(today);

		while (set.has(date.toISOString().split("T")[0])) {
			streak++;
			date.setDate(date.getDate() - 1);
		}

		return streak;
	}
}
