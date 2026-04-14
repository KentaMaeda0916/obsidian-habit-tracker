import { ItemView, WorkspaceLeaf } from "obsidian";
import HabitTrackerPlugin from "./main";
import { Habit, todayString } from "./HabitStorage";
import { HabitModal } from "./HabitModal";

export const HABIT_TRACKER_VIEW_TYPE = "habit-tracker-view";

export class HabitView extends ItemView {
	private plugin: HabitTrackerPlugin;
	private habits: Habit[] = [];
	private today = "";
	/** 全操作を直列実行するキュー */
	private queue: Promise<void> = Promise.resolve();

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
		this.addAction("refresh-cw", "再読み込み", () => this.enqueue(() => this.reload()));
		await this.reload();
	}

	async onClose() {}

	/** 操作をキューに積んで直列実行する */
	private enqueue(fn: () => Promise<void>): void {
		this.queue = this.queue
			.then(fn)
			.catch(err => console.error("[HabitTracker]", err));
	}

	/** ストレージから習慣を読み込んで画面を更新する */
	private async reload(): Promise<void> {
		this.habits = await this.plugin.storage.loadAllHabits();
		this.renderUI();
	}

	private renderUI() {
		// 日付跨ぎに対応するため毎回取得
		this.today = todayString();

		const root = this.containerEl.children[1];
		root.empty();

		const displayDate = new Date().toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "long",
			day: "numeric",
			weekday: "short",
		});

		const container = root.createEl("div", { cls: "habit-tracker-container" });

		// ヘッダー
		const header = container.createEl("div", { cls: "habit-tracker-header" });
		const headerTop = header.createEl("div", { cls: "habit-tracker-header-top" });
		headerTop.createEl("h2", { text: "Habit Tracker" });
		const refreshBtn = headerTop.createEl("button", { cls: "habit-tracker-refresh-btn" });
		refreshBtn.setAttribute("aria-label", "再読み込み");
		refreshBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`;
		refreshBtn.addEventListener("click", () => this.enqueue(() => this.reload()));
		header.createEl("p", { text: displayDate, cls: "habit-tracker-date" });

		// 習慣リスト
		const listEl = container.createEl("div", { cls: "habit-tracker-list" });

		if (this.habits.length === 0) {
			listEl.createEl("p", {
				text: "習慣がまだありません。下のボタンから追加してください。",
				cls: "habit-tracker-empty",
			});
		}

		for (const habit of this.habits) {
			const isCompleted = habit.completions.includes(this.today);
			const streak = this.plugin.storage.calculateStreak(habit.completions, this.today);

			const itemEl = listEl.createEl("div", {
				cls: `habit-tracker-item${isCompleted ? " completed" : ""}`,
			});

			const checkbox = itemEl.createEl("input");
			checkbox.type = "checkbox";
			checkbox.checked = isCompleted;
			checkbox.addEventListener("change", () => {
				// change 時点のチェック状態を確定値として使う（toggle ではなく set）
				const completed = checkbox.checked;
				this.enqueue(async () => {
					await this.plugin.storage.setCompletion(habit.name, this.today, completed);
					await this.reload();
				});
			});

			const labelEl = itemEl.createEl("div", { cls: "habit-tracker-label" });
			labelEl.createEl("span", { text: habit.displayName, cls: "habit-tracker-name" });
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
				this.enqueue(() => this.reload());
			}).open();
		});
	}
}
