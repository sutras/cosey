import { enhanceComponent, type EnhancedComponent } from '../utils';
import FormTabs from './form-tabs';
import FormTabPanel from './form-tab-panel.vue';

export * from './form-tabs.api';

const _FormTabs: EnhancedComponent<typeof FormTabs> = enhanceComponent(FormTabs);
const _FormTabPanel: EnhancedComponent<typeof FormTabPanel> = enhanceComponent(FormTabPanel);

export { _FormTabs as FormTabs, _FormTabPanel as FormTabPanel };
export default _FormTabs;
