<script lang="ts">
let { href = '/', onClick } = $props();
</script>

<a class="ds-topbar-brand" {href} id="site-logo" data-astro-prefetch onclick={onClick}>
	<img src="/img/dailyscape.png" alt="RSDailies" width="24" height="24" class="ds-brand-mark" />
	RSDailies
</a>
