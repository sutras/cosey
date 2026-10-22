import { enhanceComponent, type EnhancedComponent } from '../utils';
import CoAsync from './async';

export * from './async.api';

const _CoAsync: EnhancedComponent<typeof CoAsync> = enhanceComponent(CoAsync);

export { _CoAsync as CoAsync };
export default _CoAsync;
