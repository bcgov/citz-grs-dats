import { sortPSPContent, type PSPContentGroup } from "@/modules/transfer/utils/sortPSPContent";
import type { TransferZod } from "@/modules/transfer/entities";

type FoldersType = TransferZod["metadata"]["folders"];

describe("sortPSPContent", () => {
	// Test case: Empty folders
	it("should return an empty array when given an empty object", () => {
		const folders: FoldersType = {};
		const result = sortPSPContent(folders);
		expect(result).toEqual([]);
	});

	// Test case: Single folder
	it("should group a single folder correctly", () => {
		const folders: FoldersType = {
			Folder1: {
				schedule: "A",
				classification: "X",
				file: null,
				opr: null,
				startDate: null,
				endDate: null,
				soDate: null,
				fdDate: null,
			},
		};
		const expected: PSPContentGroup[] = [
			{ schedule: "A", classification: "X", content: ["Folder1"] },
		];
		const result = sortPSPContent(folders);
		expect(result).toEqual(expected);
	});

	// Test case: Multiple folders with the same schedule and classification
	it("should group folders with the same schedule and classification", () => {
		const folders: FoldersType = {
			Folder1: {
				schedule: "A",
				classification: "X",
				file: null,
				opr: null,
				startDate: null,
				endDate: null,
				soDate: null,
				fdDate: null,
			},
			Folder2: {
				schedule: "A",
				classification: "X",
				file: null,
				opr: null,
				startDate: null,
				endDate: null,
				soDate: null,
				fdDate: null,
			},
		};
		const expected: PSPContentGroup[] = [
			{ schedule: "A", classification: "X", content: ["Folder1", "Folder2"] },
		];
		const result = sortPSPContent(folders);
		expect(result).toEqual(expected);
	});

	// Test case: Multiple groups with different schedule and classification
	it("should group folders by schedule and classification", () => {
		const folders: FoldersType = {
			Folder1: {
				schedule: "A",
				classification: "X",
				file: null,
				opr: null,
				startDate: null,
				endDate: null,
				soDate: null,
				fdDate: null,
			},
			Folder2: {
				schedule: "B",
				classification: "Y",
				file: null,
				opr: null,
				startDate: null,
				endDate: null,
				soDate: null,
				fdDate: null,
			},
			Folder3: {
				schedule: "A",
				classification: "X",
				file: null,
				opr: null,
				startDate: null,
				endDate: null,
				soDate: null,
				fdDate: null,
			},
		};
		const expected: PSPContentGroup[] = [
			{ schedule: "A", classification: "X", content: ["Folder1", "Folder3"] },
			{ schedule: "B", classification: "Y", content: ["Folder2"] },
		];
		const result = sortPSPContent(folders);
		expect(result).toEqual(expected);
	});

	// Test case: Null and empty values
	it("should handle null and empty values correctly", () => {
		const folders: FoldersType = {
			Folder1: {
				schedule: null,
				classification: null,
				file: null,
				opr: null,
				startDate: null,
				endDate: null,
				soDate: null,
				fdDate: null,
			},
			Folder2: {
				schedule: "",
				classification: "",
				file: null,
				opr: null,
				startDate: null,
				endDate: null,
				soDate: null,
				fdDate: null,
			},
			Folder3: {
				schedule: "A",
				classification: "X",
				file: null,
				opr: null,
				startDate: null,
				endDate: null,
				soDate: null,
				fdDate: null,
			},
		};
		const expected: PSPContentGroup[] = [
			{ schedule: "", classification: "", content: ["Folder1", "Folder2"] },
			{ schedule: "A", classification: "X", content: ["Folder3"] },
		];
		const result = sortPSPContent(folders);
		expect(result).toEqual(expected);
	});
});
