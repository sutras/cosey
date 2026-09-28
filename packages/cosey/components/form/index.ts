import { enhanceComponent, type EnhancedComponent } from '../utils';
import Form from './form';
import FormItem from './form-item.vue';
import { useBubbleTemplate } from './useBubbleTemplate';
import { useFormTemplate } from './useFormTemplate';
import { useFormItemWidth, getFormItemWidth } from './useFormItemWidth';

export * from './form.api';
export * from './form-item.api';
export * from './useFormContainers';
export * from './useFormInvalid';

const _Form: EnhancedComponent<typeof Form> = enhanceComponent(Form);
const _FormItem: EnhancedComponent<typeof FormItem> = enhanceComponent(FormItem);

export {
  _Form as Form,
  _FormItem as FormItem,
  useFormTemplate,
  useBubbleTemplate,
  useFormItemWidth,
  getFormItemWidth,
};
export default _Form;
