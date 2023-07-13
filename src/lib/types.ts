import type { Database } from '../DatabaseDefinitions';

export type TODO = {
	id: string;
	name: string;
	done: boolean;
	description: string;
	children: TODO[];
	aiGenerated?: boolean;
};

export type TODOMetadata = {
	queuedDone?: boolean;
};

export type TODOWithMetadata = TODO & TODOMetadata;

export type TODOList = Database['public']['Tables']['lists']['Row'] & {
	tasks_blob: TODO[];
};
