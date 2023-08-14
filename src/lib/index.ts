import { nanoid } from 'nanoid';
import type {
	IntermediateTask,
	IntermediateTaskWithChildren,
	IntermediateTaskWithIndex,
	Task
} from './types';

// remove dnd attributes and other data inconsistencies that crash the UI
export const cleanData = (
	arr: (IntermediateTaskWithChildren & { isDndShadowItem?: boolean })[]
) => {
	return arr?.map((item: IntermediateTaskWithChildren & { isDndShadowItem?: boolean }) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { tasks, isDndShadowItem, ...newItem } = item;
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
	taskList: IntermediateTask[],
	prevTaskList: IntermediateTask[],
	prevTaskMap: Map<string, IntermediateTask>
): {
	changed: IntermediateTaskWithIndex[];
	deleted: string[];
	currentMap: Map<string, IntermediateTaskWithIndex>;
} => {
	const currentMap: Map<string, IntermediateTaskWithIndex> = new Map();
	const changed: IntermediateTaskWithIndex[] = [];
	const deleted: string[] = [];
	taskList.forEach((task, index) => currentMap.set(task.id, { ...task, child_index: index }));

	// fill in changed
	taskList.forEach((task, index) => {
		const taskWithIndex = {
			...task,
			child_index: index
		};
		const notInPreviousList = !prevTaskMap.has(task.id);
		const differentInPreviousList =
			JSON.stringify(prevTaskMap.get(task.id)) !== JSON.stringify(taskWithIndex);
		if (notInPreviousList || differentInPreviousList) {
			changed.push(taskWithIndex);
		}
	});

	// fill in deleted
	prevTaskList.forEach((task) => {
		if (!currentMap.has(task.id)) {
			deleted.push(task.id);
		}
	});

	return {
		changed,
		deleted,
		currentMap
	};
};

export const taskColors = [
	'red',
	'orange',
	'amber',
	'yellow',
	'lime',
	'green',
	'emerald',
	'teal',
	'cyan',
	'sky',
	'blue',
	'indigo',
	'violet',
	'purple',
	'fuchsia',
	'pink',
	'rose'
];
