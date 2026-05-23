<script lang="ts">
import AppHeaderBar from './AppHeaderBar.svelte';

let {
	id = '',
	colspan = 1,
	label = '',
	statusText = '',
	extraClass = '',
	dropdownActive = false,
	controls,
} = $props<{
	id?: string;
	colspan?: number;
	label?: string;
	statusText?: string;
	extraClass?: string;
	dropdownActive?: boolean;
	controls?: import('svelte').Snippet;
}>();
</script>

<tr
	data-subgroup-id={id || undefined}
	class:dropdown-active={dropdownActive}
	class={`header_like_row subgroup-header-row ${extraClass}`.trim()}
>
	<td colspan={colspan} class="header_like_color">
		<AppHeaderBar variant="subsection" {label} {statusText} controls={controls} />
	</td>
</tr>
