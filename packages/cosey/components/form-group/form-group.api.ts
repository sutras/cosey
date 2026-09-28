import { spaceProps } from 'element-plus';
import { omit } from 'lodash-es';
import type { ExtractPropTypes, SlotsType, PropType, VNodeChild } from 'vue';
import { isBoolean } from '../../utils';

export const formGroupProps = {
  ...omit(spaceProps, ['class', 'style']),
  alignment: {
    type: String as PropType<'stretch' | 'center' | 'flex-start' | 'flex-end'>,
    default: 'flex-start',
  },
  size: {
    type: [Number, String, Array] as PropType<
      number | 'default' | 'small' | 'large' | [number, number]
    >,
    default: () => [32, 0],
  },
  wrap: {
    type: Boolean,
    default: true,
  },
  title: {
    type: null as unknown as PropType<VNodeChild>,
  },
  tooltip: {
    type: null as unknown as PropType<VNodeChild>,
  },
  borderStyle: {
    type: String as PropType<'none' | 'solid' | 'dashed' | 'dotted'>,
  },
  position: {
    type: String as PropType<'left' | 'right' | 'center'>,
    default: 'left',
  },
  collapsible: {
    type: Boolean,
  },
  collapsed: {
    type: Boolean,
  },
  /** 校验失败时自动展开包含出错字段的折叠组 */
  switchToInvalid: {
    type: Boolean,
    default: true,
  },
};

export type FormGroupProps = ExtractPropTypes<typeof formGroupProps>;

export interface FormGroupSlots {
  default?: {};
  tooltip?: {};
  title?: {};
}

export const formGroupSlots = Object as SlotsType<FormGroupSlots>;

export const formGroupEmits = {
  'update:collapsed': (collapsed: boolean) => isBoolean(collapsed),
};

export type FormGroupEmits = typeof formGroupEmits;
