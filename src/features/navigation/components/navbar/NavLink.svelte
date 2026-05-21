<script lang="ts">
let { href, label, active = false, onClick } = $props();
</script>

<li class="ds-nav-entry">
	<a
		class="ds-nav-link"
		class:active
		{href}
		data-astro-prefetch
		onclick={onClick}
	>
		{label}
	</a>
</li>
