import type { FormQueryExpose } from './form-query';

export * from './async';
export * from './audio-card';
export * from './audio-viewer';
export * from './card';
export * from './check-updates';
export * from './chart';
export * from './close';
export * from './col';
export * from './config-provider';
export * from './container';
export * from './context-menu';
export * from './copy';
export * from './descriptions';
export * from './dict';
export * from './dnd-sort';
export * from './editor';
export * from './field';
export * from './file-card';
export * from './form';
export * from './form-dialog';
export * from './form-drawer';
export * from './form-group';
export * from './form-list';
export * from './form-query';
export * from './form-steps';
export * from './form-tabs';
export * from './highlight';
export * from './horizontal-tree';
export * from './icon';
export * from './iconify-icon';
export * from './image-card';
export * from './input-number-range';
export * from './long-text';
export * from './mask';
export * from './media-card';
export * from './media-card-group';
export * from './media-viewer';
export * from './number-format';
export * from './only-child';
export * from './optional-wrapper';
export * from './remote-select';
export * from './ribbon';
export * from './row';
export * from './scroll-view';
export * from './snug-menu';
export * from './stack-dialog';
export * from './svg-icon';
export * from './table';
export * from './table-action';
export * from './table-select';
// `table-query` 已并入 `form-query`（同一个组件对象、同一份 props 与 expose），
// 这里只为旧调用方保留名字。深层路径 `cosey/components/table-query` 不再提供。
/** @deprecated 用 `FormQuery` */
export { FormQuery as TableQuery } from './form-query';
export {
  formQueryProps as tableQueryProps,
  formQuerySlots as tableQuerySlots,
  formQueryEmits as tableQueryEmits,
  formQueryExposeKeys as tableQueryExposeKeys,
  createFormQueryScheme as createScheme,
} from './form-query';
export type {
  FormQueryProps as TableQueryProps,
  FormQueryScheme as TableQueryScheme,
  FormQuerySlots as TableQuerySlots,
  FormQueryEmits as TableQueryEmits,
  FormQueryExpose as TableQueryExpose,
} from './form-query';
/** @deprecated 这些能力已并入 `FormQueryExpose` */
export type TableQueryCustomExpose = Pick<
  FormQueryExpose,
  'getFieldsValue' | 'setFieldsValue' | 'getModel' | 'reset'
>;
export * from './toggle';
export * from './transition';
export * from './transition-group';
export * from './upload';
export * from './video-card';
export * from './video-viewer';
export * from './week-range-picker';

export { registerGlobalComponents } from './components';
