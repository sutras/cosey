import { enhanceComponent, type EnhancedComponent } from '../utils';
import Table from './table.vue';

export * from './table.api.ts';
export * from './table-column/table-column.api';
export * from './useTable';
export * from './pinned-select-scheme';

const _Table: EnhancedComponent<typeof Table> = enhanceComponent(Table);

export { _Table as Table };
export default _Table;
