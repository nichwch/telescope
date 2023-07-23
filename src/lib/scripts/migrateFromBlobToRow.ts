import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../DatabaseDefinitions';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

// these types are no longer used, and have been moved from types here for compatibility
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

// https://github.com/sveltejs/kit/discussions/9807
console.log('Hello world from the script');

const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const allLists = await supabase.from('lists').select('*');

const insertTask = async (
	task: TODOWithMetadata,
	index: number,
	list_parent: string | null,
	task_parent: string | null,
	owner: string
) => {
	console.log('task', task);
	const res = await supabase
		.from('tasks')
		.insert({
			id: task.id,
			list_parent,
			task_parent,
			ai_generated: task.aiGenerated,
			child_index: index,
			description: task.description,
			done: task.done,
			name: task.name,
			owner,
			queued_done: task.queuedDone
		})
		.select('*');
	console.log('res', res);
	console.log('children #', task.children.length);
	await Promise.all(
		task.children.map((child, index) => insertTask(child, index, null, task.id, owner)) || []
	);
};

const data = allLists.data as TODOList[];
Promise.all(
	data?.map(async (list) => {
		const tasks = (list.tasks_blob || []) as TODOWithMetadata[];
		await Promise.all(
			tasks.map((task, index) => {
				return insertTask(task, index, list.id, null, list.owner);
			}) || []
		);
	})
);

console.log('FINISHED');
