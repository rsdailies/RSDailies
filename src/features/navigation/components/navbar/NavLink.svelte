<script lang="ts">
import { AppLink } from '@shared/ui';

let { href, label, active = false, onClick } = $props();
</script>

<li class="ds-nav-entry">
	<AppLink variant="nav" {href} {active} prefetch={true} onclick={onClick}>
		{label}
	</AppLink>
</li>
