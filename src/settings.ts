import { App, PluginSettingTab, Setting } from "obsidian";
import HabitTrackerPlugin from "./main";

export interface HabitTrackerSettings {
	habitsFolder: string;
}

export const DEFAULT_SETTINGS: HabitTrackerSettings = {
	habitsFolder: "habits",
};

export class HabitTrackerSettingTab extends PluginSettingTab {
	plugin: HabitTrackerPlugin;

	constructor(app: App, plugin: HabitTrackerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("習慣ファイルのフォルダ")
			.setDesc("習慣データを保存するフォルダのパス（Dataviewでクエリする際に使用）")
			.addText(text =>
				text
					.setPlaceholder("habits")
					.setValue(this.plugin.settings.habitsFolder)
					.onChange(async value => {
						this.plugin.settings.habitsFolder = value.trim() || "habits";
						await this.plugin.saveSettings();
					})
			);
	}
}
