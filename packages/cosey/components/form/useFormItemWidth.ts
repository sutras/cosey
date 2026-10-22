import { computed, type CSSProperties } from 'vue';
import { type FieldType } from '../field';
import { type FormContext } from './form.api';
import {
  type FormItemWidth,
  type FormItemPresetWidth,
  type FormItemProps,
  mapFormItemWidth,
} from './form-item.api';
import { isNumber, isString } from '../../utils';

/** 把 `104` / `'md'` / `'320px'` 统一转成 CSS 长度，认不出来返回 undefined */
export function resolveFormItemWidth(value?: FormItemWidth) {
  const presetWidth = mapFormItemWidth[value as FormItemPresetWidth];

  if (isNumber(presetWidth)) {
    return presetWidth + 'px';
  }

  if (isNumber(value)) {
    return value + 'px';
  }

  if (isString(value) && value) {
    return value;
  }

  return undefined;
}

export function getFormItemWidth(outWidth?: FormItemWidth, minWidth?: FormItemWidth) {
  const width = resolveFormItemWidth(outWidth);
  const min = resolveFormItemWidth(minWidth);

  if (width) {
    return min ? { width, minWidth: min } : { width };
  }

  return {
    flex: 1,
    minWidth: min ?? 0,
  };
}

export function useFormItemWidth<T extends FieldType>(
  props: FormItemProps<T>,
  formContext?: FormContext | null,
) {
  return computed<CSSProperties>(() => {
    const outWidth = props.width ?? formContext?.width;

    return getFormItemWidth(outWidth, formContext?.minWidth);
  });
}
