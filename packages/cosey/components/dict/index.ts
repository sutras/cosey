import { enhanceComponent, type EnhancedComponent } from '../utils';
import CoDictTag from './co-dict-tag';

export * from './co-dict-tag.api';

const _CoDictTag: EnhancedComponent<typeof CoDictTag> = enhanceComponent(CoDictTag);

export { _CoDictTag as CoDictTag };
export default _CoDictTag;
