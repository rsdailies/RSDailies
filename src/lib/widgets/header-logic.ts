export function resolveHeaderContext(context: any = {}) {
	return {
		isCollapsedBlock: context.isCollapsedBlock || (() => false),
		setCollapsedBlock: context.setCollapsedBlock || (() => {}),
		renderApp: context.renderApp || (() => {}),
	};
}

export function canRenderRestoreMenu(restoreOptions: any[] = [], onRestoreSelect: any = null) {
	return Array.isArray(restoreOptions) && restoreOptions.length > 0 && typeof onRestoreSelect === 'function';
}

export function getCollapseState(blockId: string, context: any = {}) {
	const { isCollapsedBlock } = resolveHeaderContext(context);
	return Boolean(blockId && isCollapsedBlock(blockId));
}
