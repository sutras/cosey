import { enhanceComponent, type EnhancedComponent } from '../utils';
import CoPage from './co-page';

export * from './co-page.api';

const _CoPage: EnhancedComponent<typeof CoPage> = enhanceComponent(CoPage);

export { _CoPage as CoPage };
export default _CoPage;
