import type { ReactNode } from 'react';

export type NavItemProps = {
	path: string;
	label: string;
	icon: ReactNode;
	role?: string;
};
