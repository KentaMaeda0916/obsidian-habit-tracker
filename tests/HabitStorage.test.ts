import { describe, it, expect, vi, beforeEach } from "vitest";
import { HabitStorage, type Habit, localDateString } from "../src/HabitStorage";
import * as ObsidianModule from "obsidian";

// obsidian モジュールをスタブ化（vi.mock はホイストされるため import より先に実行される）
vi.mock("obsidian", () => {
	class TFile {
		path: string;
		basename: string;
		extension: string;
		parent: { path: string };
		constructor(path: string) {
			this.path = path;
			this.basename = path.split("/").pop()!.replace(/\.md$/, "");
			this.extension = "md";
			const lastSlash = path.lastIndexOf("/");
			this.parent = { path: lastSlash >= 0 ? path.substring(0, lastSlash) : "" };
		}
	}
	return { TFile, normalizePath: (p: string) => p, App: class {} };
});

// モック済みの TFile クラスを取得（instanceof チェックのために実インスタンスが必要）
const TFileMock = ObsidianModule.TFile as unknown as new (path: string) => any;

// ---------------------------------------------------------------------------
// テスト用ファクトリ
// ---------------------------------------------------------------------------

/** インメモリ vault を持つ環境を作成する */
function createMockEnv(initialFiles: Record<string, string> = {}) {
	const fs = new Map<string, string>(Object.entries(initialFiles));

	const vault = {
		getAbstractFileByPath: vi.fn((path: string) =>
			fs.has(path) ? new TFileMock(path) : null
		),
		read: vi.fn(async (file: any) => fs.get(file.path) ?? ""),
		cachedRead: vi.fn(async (file: any) => fs.get(file.path) ?? ""),
		modify: vi.fn(async (file: any, content: string) => {
			fs.set(file.path, content);
		}),
		create: vi.fn(async (path: string, content: string) => {
			fs.set(path, content);
		}),
		delete: vi.fn(async (file: any) => {
			fs.delete(file.path);
		}),
		getFiles: vi.fn(() => [...fs.keys()].map(p => new TFileMock(p))),
		createFolder: vi.fn(async () => {}),
	};

	const plugin = {
		app: { vault },
		settings: { habitsFolder: "habits" },
	} as any;

	const storage = new HabitStorage(plugin);
	return { storage, vault, fs };
}

/** 習慣ファイルの frontmatter を組み立てる */
function buildFileContent(
	habit: string,
	description: string,
	created: string,
	completions: string[]
): string {
	const compList =
		completions.length > 0
			? `completions:\n${completions.map(d => `  - ${d}`).join("\n")}`
			: `completions: []`;
	return `---\nhabit: "${habit}"\ndescription: "${description}"\ncreated: ${created}\n${compList}\n---\n`;
}

/** 今日から N 日前の日付文字列 */
function daysAgo(n: number): string {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return localDateString(d);
}

// ---------------------------------------------------------------------------
// テスト
// ---------------------------------------------------------------------------

describe("calculateStreak", () => {
	let storage: HabitStorage;

	beforeEach(() => {
		({ storage } = createMockEnv());
	});

	it("completions が空なら 0 を返す", () => {
		expect(storage.calculateStreak([], daysAgo(0))).toBe(0);
	});

	it("今日だけチェックなら 1 を返す", () => {
		expect(storage.calculateStreak([daysAgo(0)], daysAgo(0))).toBe(1);
	});

	it("昨日と今日チェックなら 2 を返す", () => {
		expect(storage.calculateStreak([daysAgo(1), daysAgo(0)], daysAgo(0))).toBe(2);
	});

	it("連続 5 日チェックなら 5 を返す", () => {
		const completions = [4, 3, 2, 1, 0].map(daysAgo);
		expect(storage.calculateStreak(completions, daysAgo(0))).toBe(5);
	});

	it("今日が抜けている場合は 0 を返す（昨日まで連続していても）", () => {
		const completions = [3, 2, 1].map(daysAgo);
		expect(storage.calculateStreak(completions, daysAgo(0))).toBe(0);
	});

	it("途中で抜けがある場合は今日からの連続日数を返す", () => {
		// 5日前と3,2,1,0日前 → 今日から連続4日
		const completions = [daysAgo(5), daysAgo(3), daysAgo(2), daysAgo(1), daysAgo(0)];
		expect(storage.calculateStreak(completions, daysAgo(0))).toBe(4);
	});
});

// ---------------------------------------------------------------------------

describe("loadHabit / saveHabit / habitCache の挙動", () => {
	it("初回 loadHabit はキャッシュなしなので vault.read を呼ぶ", async () => {
		const { storage, vault } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", []),
		});
		await storage.loadHabit("running");
		// saveHabit 内の vault.read（既存ファイルの本文保持用）を除いた呼び出し回数を確認
		expect(vault.read).toHaveBeenCalledTimes(1);
	});

	it("saveHabit 後の loadHabit はキャッシュから返す（vault.read を追加で呼ばない）", async () => {
		const { storage, vault } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", []),
		});
		// 一度ロードしてキャッシュに入れる
		const habit = await storage.loadHabit("running");
		vault.read.mockClear();

		// 保存（saveHabit 内で vault.read を 1 回呼ぶ）
		await storage.saveHabit(habit!);
		const readCountAfterSave = (vault.read as any).mock.calls.length;

		// 再ロード → キャッシュヒットなので vault.read の呼び出しは増えない
		await storage.loadHabit("running");
		expect(vault.read).toHaveBeenCalledTimes(readCountAfterSave);
	});

	it("saveHabit はキャッシュを即時更新する（vault が古い内容を返しても正しい値が取れる）", async () => {
		const { storage, vault } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", []),
		});

		// 最初にロード（キャッシュに入る）
		await storage.loadHabit("running");

		// vault が古い内容（completions なし）を返し続けるようにスタブ
		vault.read.mockResolvedValue(
			buildFileContent("Running", "", "2024-01-01", [])
		);

		// 新しいデータで保存（completions あり）
		const updated: Habit = {
			name: "running",
			displayName: "Running",
			description: "",
			created: "2024-01-01",
			completions: ["2024-06-01"],
		};
		await storage.saveHabit(updated);

		// vault が古い内容を返してもキャッシュから正しい値が返る
		const loaded = await storage.loadHabit("running");
		expect(loaded?.completions).toContain("2024-06-01");
	});

	it("clearCache 後の loadHabit は vault.read を呼ぶ（ディスク直読みでクロスデバイス同期を反映）", async () => {
		const { storage, vault } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", []),
		});

		// キャッシュに入れる
		await storage.loadHabit("running");
		vault.read.mockClear();

		// キャッシュクリア → 再ロードで vault.read が呼ばれる
		storage.clearCache();
		await storage.loadHabit("running");
		expect(vault.read).toHaveBeenCalledTimes(1);
	});

	it("clearCache 後に vault が返す最新内容が反映される（クロスデバイス同期シナリオ）", async () => {
		const { storage, vault } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", []),
		});

		// 初回ロード（completions なし）
		const before = await storage.loadHabit("running");
		expect(before?.completions).toHaveLength(0);

		// 別デバイスが同期 → vault.read が新しい内容を返すようになる（ディスク更新済み）
		vault.read.mockResolvedValue(
			buildFileContent("Running", "", "2024-01-01", ["2024-06-01"])
		);

		// キャッシュクリアせずに再ロード → 古いキャッシュが返る（まだ反映されない）
		const stale = await storage.loadHabit("running");
		expect(stale?.completions).toHaveLength(0);

		// clearCache → 再ロード → vault.read で同期済みの内容が反映される
		storage.clearCache();
		const after = await storage.loadHabit("running");
		expect(after?.completions).toContain("2024-06-01");
	});
});

// ---------------------------------------------------------------------------

describe("setCompletion の冪等性", () => {
	it("未チェック → completed=true でチェックが追加される", async () => {
		const today = daysAgo(0);
		const { storage, vault } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", []),
		});
		await storage.setCompletion("running", today, true);
		const habit = await storage.loadHabit("running");
		expect(habit?.completions).toContain(today);
	});

	it("チェック済み → completed=true は no-op（vault.modify が呼ばれない）", async () => {
		const today = daysAgo(0);
		const { storage, vault } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", [today]),
		});
		await storage.setCompletion("running", today, true);
		// saveHabit が呼ばれないので vault.modify は呼ばれない
		expect(vault.modify).not.toHaveBeenCalled();
	});

	it("チェック済み → completed=false でチェックが除去される", async () => {
		const today = daysAgo(0);
		const { storage } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", [today]),
		});
		await storage.setCompletion("running", today, false);
		const habit = await storage.loadHabit("running");
		expect(habit?.completions).not.toContain(today);
	});

	it("未チェック → completed=false は no-op（vault.modify が呼ばれない）", async () => {
		const today = daysAgo(0);
		const { storage, vault } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", []),
		});
		await storage.setCompletion("running", today, false);
		expect(vault.modify).not.toHaveBeenCalled();
	});

	it("setCompletion を 2 回連続で呼んでも completions に重複が生じない", async () => {
		const today = daysAgo(0);
		const { storage } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", []),
		});
		await storage.setCompletion("running", today, true);
		await storage.setCompletion("running", today, true);
		const habit = await storage.loadHabit("running");
		const todayEntries = habit?.completions.filter(d => d === today) ?? [];
		expect(todayEntries).toHaveLength(1);
	});
});

// ---------------------------------------------------------------------------

describe("loadAllHabits", () => {
	it("created 順にソートされる", async () => {
		const { storage } = createMockEnv({
			"habits/b.md": buildFileContent("B", "", "2024-02-01", []),
			"habits/a.md": buildFileContent("A", "", "2024-01-01", []),
			"habits/c.md": buildFileContent("C", "", "2024-03-01", []),
		});
		const habits = await storage.loadAllHabits();
		expect(habits.map(h => h.name)).toEqual(["a", "b", "c"]);
	});

	it("habits フォルダ外のファイルは除外される", async () => {
		const { storage } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", []),
			"other/note.md": "# not a habit",
		});
		const habits = await storage.loadAllHabits();
		expect(habits).toHaveLength(1);
		expect(habits[0].name).toBe("running");
	});
});

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// バグ再現テスト: clearCache がローカル書き込みを誤って消すケース
// ---------------------------------------------------------------------------

describe("clearCache: ローカル書き込みは evict されない（更新ボタン後もチェックが維持される）", () => {
	it("[バグ再現] ローカルでチェック後に clearCache しても、vault.read が古くてもチェックが維持される", async () => {
		const today = daysAgo(0);
		const { storage, vault } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", []),
		});

		// vault.read が常に古いデータを返す（mobile での vault.modify 遅延を模倣）
		vault.read.mockImplementation(async () =>
			buildFileContent("Running", "", "2024-01-01", [])
		);

		// ローカルでチェック → habitCache 更新（localWrites に登録）
		await storage.setCompletion("running", today, true);

		// 更新ボタン相当: clearCache → ローカル書き込み済みなので habitCache を維持 → チェック維持
		storage.clearCache();
		const habits = await storage.loadAllHabits();
		const habit = habits.find(h => h.name === "running");
		expect(habit?.completions).toContain(today);
	});

	it("ローカル未書き込みの習慣は clearCache 後に vault.read から再読みされる（他デバイス同期が反映される）", async () => {
		const syncedDate = "2025-06-01";
		const { storage, fs } = createMockEnv({
			"habits/yoga.md": buildFileContent("Yoga", "", "2024-01-01", []),
		});

		// 初回ロード（ローカル書き込みなし）
		await storage.loadAllHabits();

		// 他デバイスが同期 → ディスク（fs）が更新される
		fs.set("habits/yoga.md", buildFileContent("Yoga", "", "2024-01-01", [syncedDate]));

		// clearCache → yoga はローカル未書き込みなので evict → vault.read で再読み → 同期内容が反映
		storage.clearCache();
		const habits = await storage.loadAllHabits();
		const habit = habits.find(h => h.name === "yoga");
		expect(habit?.completions).toContain(syncedDate);
	});

	it("ローカル書き込みあり + 他デバイス変更あり → 両方反映される", async () => {
		const localDate = daysAgo(0);
		const syncedDate = "2025-05-01";

		const { storage, vault, fs } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", []),
			"habits/yoga.md": buildFileContent("Yoga", "", "2024-01-02", []),
		});

		// 初回ロード
		await storage.loadAllHabits();

		// このデバイスで running をチェック
		await storage.setCompletion("running", localDate, true);

		// running: vault.read が古いデータを返し続ける（vault.modify の書き込み遅延を模倣）
		vault.read.mockImplementation(async (file: any) => {
			if (file.path === "habits/running.md") {
				return buildFileContent("Running", "", "2024-01-01", []); // 古い
			}
			return fs.get(file.path) ?? "";
		});

		// yoga: 他デバイスが同期 → ディスク（fs）が更新される
		fs.set("habits/yoga.md", buildFileContent("Yoga", "", "2024-01-02", [syncedDate]));

		// 更新ボタン相当
		storage.clearCache();
		const habits = await storage.loadAllHabits();

		const running = habits.find(h => h.name === "running");
		const yoga = habits.find(h => h.name === "yoga");

		// running はローカル書き込みなので habitCache から → チェック維持
		expect(running?.completions).toContain(localDate);
		// yoga はローカル未書き込みなので vault.read から → 同期内容が反映
		expect(yoga?.completions).toContain(syncedDate);
	});
});

describe("deleteHabit", () => {
	it("削除後に loadHabit は null を返す", async () => {
		const { storage } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", []),
		});
		await storage.loadHabit("running"); // キャッシュに入れる
		await storage.deleteHabit("running");
		const habit = await storage.loadHabit("running");
		expect(habit).toBeNull();
	});
});

// ---------------------------------------------------------------------------

describe("frontmatter のラウンドトリップ（saveHabit → loadHabit）", () => {
	it("displayName / description / completions が保存・復元される", async () => {
		const today = daysAgo(0);
		const { storage } = createMockEnv({
			"habits/running.md": buildFileContent("朝のランニング", "毎朝30分", "2024-01-01", [today]),
		});
		const habit = await storage.loadHabit("running");
		expect(habit?.displayName).toBe("朝のランニング");
		expect(habit?.description).toBe("毎朝30分");
		expect(habit?.completions).toContain(today);
	});

	it("saveHabit した内容を再ロードすると同じ内容が返る", async () => {
		const today = daysAgo(0);
		const { storage } = createMockEnv({
			"habits/running.md": buildFileContent("Running", "", "2024-01-01", []),
		});

		const original = await storage.loadHabit("running");
		original!.completions.push(today);
		await storage.saveHabit(original!);

		storage.clearCache(); // vault から再読みする
		const reloaded = await storage.loadHabit("running");
		expect(reloaded?.completions).toContain(today);
	});

	it("saveHabit は DataviewJS ブロックを保持する", async () => {
		const fileWithBody =
			buildFileContent("Running", "", "2024-01-01", []) +
			"```dataviewjs\nconsole.log('hello');\n```\n";
		const { storage, fs } = createMockEnv({
			"habits/running.md": fileWithBody,
		});

		const habit = await storage.loadHabit("running");
		await storage.saveHabit(habit!);

		const saved = fs.get("habits/running.md") ?? "";
		expect(saved).toContain("```dataviewjs");
		expect(saved).toContain("console.log('hello');");
	});
});
