import { enhanceComponent, type EnhancedComponent } from '../utils';
import CoDictTag from './dict-tag';

export * from './dict-tag.api';

const _CoDictTag: EnhancedComponent<typeof CoDictTag> = enhanceComponent(CoDictTag);

export { _CoDictTag as CoDictTag };
export default _CoDictTag;
