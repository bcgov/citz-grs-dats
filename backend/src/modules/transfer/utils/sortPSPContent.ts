import type { TransferZod } from "../entities";

type FoldersType = TransferZod["metadata"]["folders"];

export type PSPContentGroup = {
	schedule: string;
	classification: string;
	content: string[];
};

export const sortPSPContent = (folders: FoldersType): PSPContentGroup[] => {
	const groups: Record<string, { schedule: string; classification: string; content: string[] }> =
		{};

	for (const [folderName, metadata] of Object.entries(folders)) {
		const schedule = metadata.schedule || "";
		const classification = metadata.classification || "";
		const key = `${schedule}::${classification}`;

		if (!groups[key]) {
			groups[key] = {
				schedule,
				classification,
				content: [],
			};
		}

		groups[key].content.push(folderName);
	}

	return Object.values(groups);
};
