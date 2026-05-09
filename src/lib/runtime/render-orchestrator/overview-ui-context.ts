import { SECTION_TABLE_IDS } from '../../shared/section-ids.ts';
import { appendTaskDetails } from '../../widgets/task-details.ts';

export function createUiContext(deps: any, renderSelf: () => void) {
	const {
		load,
		save,
		getTaskState,
		hideTask,
		setTaskCompleted,
		clearTimer,
		startTimer,
		startCooldown,
		isCollapsedBlock,
		setCollapsedBlock,
		getPageMode,
	} = deps;

	return {
		load,
		save,
		getTaskState,
		cloneRowTemplate: () => document.getElementById('sample_row')?.content?.firstElementChild?.cloneNode(true) || null,
		createInlineActions: (_task: any, isCustom: boolean) => {
			if (isCustom) return null;

			const wrapper = document.createElement('div');
			wrapper.className = 'activity_inline_actions';
			return wrapper.children.length ? wrapper : null;
		},
		appendRowText: (desc: HTMLElement, task: any) => appendTaskDetails(desc, task),
		renderApp: renderSelf,
		hideTask,
		setTaskCompleted,
		clearTimer,
		startTimer,
		startCooldown,
		getTableId: (sectionKey: string) => SECTION_TABLE_IDS[sectionKey],
		isCollapsedBlock,
		setCollapsedBlock,
		getPageMode,
	};
}
