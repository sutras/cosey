import { enhanceComponent, type EnhancedComponent } from '../utils';
import Descriptions from './descriptions';
import DescriptionsItem from './descriptions-item';

export * from './descriptions.api';

const _Descriptions: EnhancedComponent<typeof Descriptions> = enhanceComponent(Descriptions);
const _DescriptionsItem: EnhancedComponent<typeof DescriptionsItem> =
  enhanceComponent(DescriptionsItem);

export { _Descriptions as Descriptions, _DescriptionsItem as DescriptionsItem };
export default _Descriptions;
