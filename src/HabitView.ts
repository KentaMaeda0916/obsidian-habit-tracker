import { ItemView, WorkspaceLeaf } from "obsidian";
import HabitTrackerPlugin from "./main";
import { HabitModal } from "./HabitModal";

export const HABIT_TRACKER_VIEW_TYPE = "habit-tracker-view";

export class HabitView extends ItemView {
	private plugin: HabitTrackerPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: HabitTrackerPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return HABIT_TRACKER_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Habit Tracker";
	}

	getIcon(): string {
		return "check-circle";
	}

	async onOpen() {
		await this.render();
	}

	async onClose() {}

	async render() {
		const root = this.containerEl.children[1];
		root.empty();

		const today = new Date().toISOString().split("T")[0];
		const displayDate = new Date().toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "long",
			day: "numeric",
			weekday: "short",
		});

		const container = root.createEl("div", { cls: "habit-tracker-container" });

		// ヘッダー
		const header = container.createEl("div", { cls: "habit-tracker-header" });
		header.createEl("h2", { text: "Habit Tracker" });
		header.createEl("p", { text: displayDate, cls: "habit-tracker-date" });

		// 習慣リスト
		const habits = await this.plugin.storage.loadAllHabits();
		const listEl = container.createEl("div", { cls: "habit-tracker-list" });

		if (habits.length === 0) {
			listEl.createEl("p", {
				text: "習慣がまだありません。下のボタンから追加してください。",
				cls: "habit-tracker-empty",
			});
		}

		for (const habit of habits) {
			const isCompleted = habit.completions.includes(today);
			const streak = this.plugin.storage.calculateStreak(habit.completions, today);

			const itemEl = listEl.createEl("div", {
				cls: `habit-tracker-item${isCompleted ? " completed" : ""}`,
			});

			const checkbox = itemEl.createEl("input");
			checkbox.type = "checkbox";
			checkbox.checked = isCompleted;
			checkbox.addEventListener("change", async () => {
				await this.plugin.storage.toggleCompletion(habit.name, today);
				await this.render();
			});

			const labelEl = itemEl.createEl("div", { cls: "habit-tracker-label" });
			labelEl.createEl("span", { text: habit.name, cls: "habit-tracker-name" });
			if (habit.description) {
				labelEl.createEl("span", { text: habit.description, cls: "habit-tracker-desc" });
			}

			if (streak > 0) {
				itemEl.createEl("span", {
					text: `🔥 ${streak}`,
					cls: "habit-tracker-streak",
				});
			}
		}

		// フッター（追加ボタン）
		const footer = container.createEl("div", { cls: "habit-tracker-footer" });
		const addBtn = footer.createEl("button", {
			text: "+ 習慣を追加",
			cls: "habit-tracker-add-btn",
		});
		addBtn.addEventListener("click", () => {
			new HabitModal(this.app, this.plugin, async () => {
				await this.render();
			}).open();
		});
	}
}
