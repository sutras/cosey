import type { ExtractPropTypes, PropType, SlotsType } from 'vue';
import { isString } from '../../utils';

export const editorProps = {
  modelValue: {
    type: String,
  },
  placeholder: {
    type: String,
  },
  height: {
    type: String,
  },
  maxHeight: {
    type: String,
  },
  readonly: {
    type: Boolean,
  },
  disabled: {
    type: Boolean,
  },
  validateEvent: {
    type: Boolean,
    default: true,
  },
  /**
   * 工具栏展示形态：
   * - `default`（默认）：固定工具栏，常驻在编辑区上方。
   * - `float`：浮动工具栏。选中文本后浮出「行内样式」工具条；鼠标移入编辑器时，
   *   在块级元素左侧浮出「块级菜单」入口按钮，点击弹出上下文菜单。
   */
  toolbar: {
    type: String as PropType<'float' | 'static'>,
    default: 'static',
  },
};

export type EditorProps = ExtractPropTypes<typeof editorProps>;

export interface EditorSlots {
  default: {};
}

export const editorSlots = Object as SlotsType<EditorSlots>;

export const editorEmits = {
  change: (value: string) => isString(value),
  'update:modelValue': (value: string) => isString(value),
};

export type EditorEmits = typeof editorEmits;

export interface EditorExpose {}
