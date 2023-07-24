import { nanoid } from 'nanoid';
import type { IntermediateTaskWithChildren, Task } from './types';

// remove dnd attributes and other data inconsistencies that crash the UI
export const cleanData = (arr: (Task & { isDndShadowItem?: boolean })[]) => {
	return arr?.map((item: Task & { isDndShadowItem?: boolean }) => {
		const newItem = { ...item };
		delete newItem.isDndShadowItem;
		// address failure mode where id is set to id:dnd-shadow-placeholder-0000, might happen after mobile sessions
		// TODO: this could be a big problem with row based tasks!!!!
		if (newItem.id.includes('dnd-shadow-placeholder')) {
			newItem.id = nanoid();
		}
		return newItem;
	});
};

export const stringifyTodos = (task: Task, prefix = ''): string => {
	const name = task?.name?.trim();
	const description = task?.description?.trim();
	const nameSnippet = name ? name : 'untitled task';
	const descriptionSnippet = description
		? `\n${prefix}description: ${description.replaceAll('\n', '')}`
		: '';

	return `${prefix}${nameSnippet}${descriptionSnippet}\n`;
};

export const FLIP_DURATION_MS = 300;

export const NAME_TEXTAREA_CLASS = 'name_textarea';

export const diffLists = (
	taskList: IntermediateTaskWithChildren[],
	prevTaskList: string[]
): {
	updated: Task[];
	created: Task[];
	deleted: string[];
} => {
	return {
		updated: [],
		created: [],
		deleted: []
	};
};
