<script lang="ts">
import { AppTableShell } from '@shared/ui';

let { tableId = '', columns = [], collapsed = false, header, children } = $props();
</script>

<AppTableShell {tableId} {columns} {collapsed} {header} {children} />
