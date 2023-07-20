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
export const stringifyTodos = (task: SimplifiedTODO, prefix = ''): string => {
	return `${prefix}name: ${task?.name || 'untitled'}
${prefix}description:${task?.description?.trim() || ''}
${
	task?.children
		? prefix +
		  'subtasks:\n' +
		  task?.children?.map((child) => stringifyTodos(child, `${prefix}  `)).join('')
		: ''
}\n`;
};

export const FLIP_DURATION_MS = 300;

export const NAME_TEXTAREA_CLASS = 'name_textarea';
