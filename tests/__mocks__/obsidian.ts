export class TFile {
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

export const normalizePath = (p: string) => p;

export class App {}
