import { enhanceComponent, type EnhancedComponent } from '../utils';
import RemoteSelect from './remote-select';

export * from './remote-select.api';
export * from './with-pinned-value';

const _RemoteSelect: EnhancedComponent<typeof RemoteSelect> = enhanceComponent(RemoteSelect);

export { _RemoteSelect as RemoteSelect };
export default _RemoteSelect;
