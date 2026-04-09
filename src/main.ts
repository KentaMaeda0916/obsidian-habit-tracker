import { Platform, Plugin } from "obsidian";
import { HabitView, HABIT_TRACKER_VIEW_TYPE } from "./HabitView";
import { HabitStorage } from "./HabitStorage";
import { HabitTrackerSettings, HabitTrackerSettingTab, DEFAULT_SETTINGS } from "./settings";

export default class HabitTrackerPlugin extends Plugin {
	settings: HabitTrackerSettings;
	storage: HabitStorage;

	async onload() {
		await this.loadSettings();
		this.storage = new HabitStorage(this);

		this.registerView(
			HABIT_TRACKER_VIEW_TYPE,
			leaf => new HabitView(leaf, this)
		);

		this.addRibbonIcon("check-circle", "Habit Tracker を開く", () => {
			this.activateView();
		});

		this.addCommand({
			id: "open-habit-tracker",
			name: "Open Habit Tracker",
			callback: () => this.activateView(),
		});

		this.addSettingTab(new HabitTrackerSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(async () => {
			await this.storage.ensureDashboard();
			this.activateView();
		});
	}

	async onunload() {
		this.app.workspace.detachLeavesOfType(HABIT_TRACKER_VIEW_TYPE);
	}

	async activateView() {
		const { workspace } = this.app;
		const leaves = workspace.getLeavesOfType(HABIT_TRACKER_VIEW_TYPE);

		if (leaves.length > 0) {
			workspace.revealLeaf(leaves[0]);
			return;
		}

		const leaf = Platform.isDesktop
			? workspace.getRightLeaf(false)
			: workspace.getLeaf("tab");
		if (leaf) {
			await leaf.setViewState({ type: HABIT_TRACKER_VIEW_TYPE, active: true });
			workspace.revealLeaf(leaf);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
