<script lang="ts">
import { APP_NAME } from '../../../../shared/app-meta.js';

let { href = '/', onClick } = $props();
</script>

<a class="ds-topbar-brand" {href} id="site-logo" data-astro-prefetch onclick={onClick}>
	<img src="/img/dailyscape.png" alt={APP_NAME} width="24" height="24" class="ds-brand-mark" />
	{APP_NAME}
</a>
