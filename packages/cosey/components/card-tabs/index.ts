import { enhanceComponent, type EnhancedComponent } from '../utils';
import CardTabs from './card-tabs';
import CardTabPanel from './card-tab-panel.vue';

export * from './card-tabs.api';

const _CardTabs: EnhancedComponent<typeof CardTabs> = enhanceComponent(CardTabs);
const _CardTabPanel: EnhancedComponent<typeof CardTabPanel> = enhanceComponent(CardTabPanel);

export { _CardTabs as CardTabs, _CardTabPanel as CardTabPanel };
export default _CardTabs;
