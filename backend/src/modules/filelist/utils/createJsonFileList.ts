import { formatDate } from "src/utils";
import type { CreateFileListBody, JsonFileList } from "../schemas";
import type { FileListMongoose } from "../entities";

type Data = {
	folders:
		| NonNullable<FileListMongoose["metadata"]>["folders"]
		| CreateFileListBody["metadata"]["folders"];
	files:
		| NonNullable<FileListMongoose["metadata"]>["files"]
		| CreateFileListBody["metadata"]["files"];
	accession?: string | null | undefined;
	application?: string | null | undefined;
};

export const createJsonFileList = ({
	accession = "",
	application = "",
	folders,
	files,
}: Data): JsonFileList => {
	return {
		admin: {
			lastRevised: formatDate(new Date().toDateString()),
			accession: accession === null ? "" : accession,
			application: application === null ? "" : application,
		},
		folderList: folders as unknown as JsonFileList["folderList"],
		metadata: files as unknown as JsonFileList["metadata"],
	};
};
