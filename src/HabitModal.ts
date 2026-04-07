import { App, Modal, Setting } from "obsidian";
import HabitTrackerPlugin from "./main";

export class HabitModal extends Modal {
	private plugin: HabitTrackerPlugin;
	private onSubmit: () => Promise<void>;
	private habitName = "";
	private description = "";

	constructor(app: App, plugin: HabitTrackerPlugin, onSubmit: () => Promise<void>) {
		super(app);
		this.plugin = plugin;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "習慣を追加" });

		new Setting(contentEl)
			.setName("習慣名")
			.addText(text =>
				text
					.setPlaceholder("例: 運動")
					.onChange(value => {
						this.habitName = value;
					})
			);

		new Setting(contentEl)
			.setName("説明（任意）")
			.addText(text =>
				text
					.setPlaceholder("例: 毎日30分")
					.onChange(value => {
						this.description = value;
					})
			);

		new Setting(contentEl).addButton(btn =>
			btn
				.setButtonText("追加")
				.setCta()
				.onClick(async () => {
					const name = this.habitName.trim();
					if (!name) return;
					// ファイル名に使えない文字を除去
					const safeName = name.replace(/[\\/:*?"<>|#^[\]]/g, "_");
					await this.plugin.storage.createHabit(safeName, this.description.trim());
					await this.onSubmit();
					this.close();
				})
		);
	}

	onClose() {
		this.contentEl.empty();
	}
}
