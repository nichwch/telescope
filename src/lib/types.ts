import type { Database } from '../DatabaseDefinitions';

export type TODO = {
	id: string;
	name: string;
	done: boolean;
	description: string;
	children: TODO[];
	aiGenerated?: boolean;
};

export type TODOList = Database['public']['Tables']['lists']['Row'] & {
	tasks_blob: TODO[];
};
