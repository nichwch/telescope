import { nanoid } from 'nanoid';
import type { TODO } from './types';

export const updateAtPath = (list: TODO[], newList: TODO[], paths: string[]): TODO[] => {
	const topLevelList = [...list];
	// the rest of this approach does not generalize for empty paths
	// so we hardcode it here
	if (paths.length === 0) {
		return newList;
	}
	let listPtr: Partial<TODO> & Pick<TODO, 'children'> = {
		children: topLevelList
	};
	for (const path of paths) {
		const currentItem = listPtr.children.find((item) => item.id === path);
		if (currentItem) {
			listPtr = currentItem;
		}
	}
	listPtr.children = newList;
	return topLevelList;
};

// remove dnd attributes and other data inconsistencies that crash the UI
export const cleanData = (arr: (TODO & { isDndShadowItem?: boolean })[]) => {
	return arr?.map((item: TODO & { isDndShadowItem?: boolean }) => {
		const newItem = { ...item };
		delete newItem.isDndShadowItem;
		// address failure mode where id is set to id:dnd-shadow-placeholder-0000, might happen after mobile sessions
		if (newItem.id.includes('dnd-shadow-placeholder')) {
			newItem.id = nanoid();
		}
		return newItem;
	});
};

export type SimplifiedTODO = Omit<Partial<TODO>, 'children'> & { children?: SimplifiedTODO[] };

// delete children off a todo
export const flattenTODO = (task: TODO) => {
	// eslint-disable-next-line
	const { children, ...rest } = task;
	return rest;
};
export const stringifyTodos = (task: SimplifiedTODO, prefix = ''): string => {
	const name = task?.name?.trim();
	const description = task?.description?.trim();
	const nameSnippet = name ? name : 'untitled task';
	const descriptionSnippet = description ? `\n${prefix}description: ${description}` : '';

	return `${prefix}${nameSnippet}${descriptionSnippet}${
		task?.children && task.children.length > 0
			? '\n' +
			  prefix +
			  'subtasks:\n' +
			  task?.children?.map((child) => stringifyTodos(child, `${prefix}  `)).join('')
			: ''
	}\n`;
};

export const FLIP_DURATION_MS = 300;

export const NAME_TEXTAREA_CLASS = 'name_textarea';
