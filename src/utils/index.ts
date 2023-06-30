import type { TODO } from './types';

export const updateAtPath = (list: TODO[], newList: TODO[], paths: string[]): TODO[] => {
	const topLevelList = [...list];
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

// remove dnd attributes
export const cleanData = (arr: any[]) => {
	return arr?.map((item) => {
		const newItem = { ...item };
		delete newItem.isDndShadowItem;
		return newItem;
	});
};
