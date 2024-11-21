import { formatDate } from "src/utils";
import type { CreateFileListBody, JsonFileList } from "../schemas";

type Data = {
	body: CreateFileListBody;
};

export const createJsonFileList = ({ body }: Data): JsonFileList => {
	return {
		admin: {
			lastRevised: formatDate(new Date().toDateString()),
			accession: body.metadata?.admin?.accession ?? "",
			application: body.metadata?.admin?.application ?? "",
			ministry: "",
			branch: "",
		},
		folderList: body.metadata.folders,
		metadata: body.metadata.files,
	};
};
