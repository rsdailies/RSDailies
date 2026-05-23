<script lang="ts">
import { AppRowActions } from '@shared/ui';

let { pinned, hidden, onPin, onHide } = $props();
</script>

<AppRowActions {pinned} {hidden} {onPin} {onHide} />
