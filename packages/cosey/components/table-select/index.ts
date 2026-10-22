import { enhanceComponent, type EnhancedComponent } from '../utils';
import TableSelect from './table-select';

export * from './table-select.api';

const _TableSelect: EnhancedComponent<typeof TableSelect> = enhanceComponent(TableSelect);

export { _TableSelect as TableSelect };
export default _TableSelect;
