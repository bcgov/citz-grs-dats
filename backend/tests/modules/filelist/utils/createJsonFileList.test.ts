import { createJsonFileList } from "@/modules/filelist/utils";
import { formatDate } from "@/utils";
import type { CreateFileListBody } from "@/modules/filelist/schemas";

jest.mock("@/utils", () => {
	const originalModule = jest.requireActual("@/utils");
	return {
		...originalModule,
		formatDate: jest.fn(),
	};
});

describe("Test suite for createJsonFileList", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("Test case: Should generate a JSON file list with correct structure and values", () => {
		const mockFormatDate = "2024-11-19";
		(formatDate as jest.Mock).mockReturnValue(mockFormatDate);

		const body: CreateFileListBody = {
			outputFileType: "json",
			metadata: {
				admin: {
					application: "TestApp",
					accession: "TestAccession",
				},
				folders: {
					folder1: { schedule: "Schedule1", classification: "Class1", opr: true },
					folder2: { startDate: "2024-01-01", endDate: "2024-12-31", soDate: null },
				},
				files: {
					file1: [
						{
							filepath: "/path/to/file1.txt",
							filename: "file1.txt",
							size: "100KB",
							birthtime: "2024-01-01T00:00:00Z",
							lastModified: "2024-01-02T00:00:00Z",
							lastAccessed: "2024-01-03T00:00:00Z",
							checksum: "abcd1234",
						},
					],
					file2: [
						{
							filepath: "/path/to/file2.txt",
							filename: "file2.txt",
							size: "200KB",
							birthtime: "2024-01-01T00:00:00Z",
							lastModified: "2024-01-02T00:00:00Z",
							lastAccessed: "2024-01-03T00:00:00Z",
							checksum: "efgh5678",
						},
					],
				},
			},
		};

		const result = createJsonFileList({
			accession: body.metadata?.admin?.accession,
			application: body.metadata?.admin?.application,
			folders: body.metadata.folders,
			files: body.metadata.files,
		});

		expect(formatDate).toHaveBeenCalledWith(new Date().toDateString());
		expect(result).toEqual({
			admin: {
				lastRevised: mockFormatDate,
				accession: "TestAccession",
				application: "TestApp",
				ministry: "",
				branch: "",
			},
			folderList: body.metadata.folders,
			metadata: body.metadata.files,
		});
	});

	it("Test case: Should handle missing admin metadata gracefully", () => {
		const mockFormatDate = "2024-11-19";
		(formatDate as jest.Mock).mockReturnValue(mockFormatDate);

		const body: CreateFileListBody = {
			outputFileType: "json",
			metadata: {
				admin: undefined,
				folders: {
					folder1: { classification: "Class1", opr: false },
				},
				files: {
					file1: [
						{
							filepath: "/path/to/file1.txt",
							filename: "file1.txt",
							size: "50KB",
							birthtime: "2024-01-01T00:00:00Z",
							lastModified: "2024-01-02T00:00:00Z",
							lastAccessed: "2024-01-03T00:00:00Z",
							checksum: "abcd1234",
						},
					],
				},
			},
		};

		const result = createJsonFileList({
			accession: body.metadata?.admin?.accession,
			application: body.metadata?.admin?.application,
			folders: body.metadata.folders,
			files: body.metadata.files,
		});

		expect(formatDate).toHaveBeenCalledWith(new Date().toDateString());
		expect(result).toEqual({
			admin: {
				lastRevised: mockFormatDate,
				accession: "",
				application: "",
				ministry: "",
				branch: "",
			},
			folderList: body.metadata.folders,
			metadata: body.metadata.files,
		});
	});

	it("Test case: Should handle empty folders and files gracefully", () => {
		const mockFormatDate = "2024-11-19";
		(formatDate as jest.Mock).mockReturnValue(mockFormatDate);

		const body: CreateFileListBody = {
			outputFileType: "json",
			metadata: {
				admin: {
					application: "TestApp",
					accession: "TestAccession",
				},
				folders: {},
				files: {},
			},
		};

		const result = createJsonFileList({
			accession: body.metadata?.admin?.accession,
			application: body.metadata?.admin?.application,
			folders: body.metadata.folders,
			files: body.metadata.files,
		});

		expect(formatDate).toHaveBeenCalledWith(new Date().toDateString());
		expect(result).toEqual({
			admin: {
				lastRevised: mockFormatDate,
				accession: "TestAccession",
				application: "TestApp",
				ministry: "",
				branch: "",
			},
			folderList: {},
			metadata: {},
		});
	});

	it("Test case: Should set accession and application to empty strings when they are null", () => {
		const mockFormatDate = "2024-11-19";
		(formatDate as jest.Mock).mockReturnValue(mockFormatDate);

		const body: CreateFileListBody = {
			outputFileType: "json",
			metadata: {
				admin: {
					application: null as unknown as string | undefined,
					accession: null as unknown as string | undefined,
				},
				folders: {
					folder1: { classification: "Class1", opr: false },
				},
				files: {
					file1: [
						{
							filepath: "/path/to/file1.txt",
							filename: "file1.txt",
							size: "50KB",
							birthtime: "2024-01-01T00:00:00Z",
							lastModified: "2024-01-02T00:00:00Z",
							lastAccessed: "2024-01-03T00:00:00Z",
							checksum: "abcd1234",
						},
					],
				},
			},
		};

		const result = createJsonFileList({
			accession: body.metadata?.admin?.accession,
			application: body.metadata?.admin?.application,
			folders: body.metadata.folders,
			files: body.metadata.files,
		});

		expect(formatDate).toHaveBeenCalledWith(new Date().toDateString());
		expect(result).toEqual({
			admin: {
				lastRevised: mockFormatDate,
				accession: "",
				application: "",
				ministry: "",
				branch: "",
			},
			folderList: body.metadata.folders,
			metadata: body.metadata.files,
		});
	});
});
