import type { ReactNode } from "react";

export type InstructionProps = {
	num: number;
	instruction: string;
	required: boolean | null;
	desc?: string | ReactNode;
};
