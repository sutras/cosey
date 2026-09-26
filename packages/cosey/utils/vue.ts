import { createVNode, defineComponent, SlotsType, type VNodeChild } from 'vue';
import { isFunction, isObject, isPlainObject } from './is';
import { upperFirst } from 'lodash-es';

/**
 * 使在 script setup 中也能使用 jsx
 */
export function defineTemplate(callback: (h: typeof createVNode) => VNodeChild) {
  return {
    render() {
      return callback(createVNode);
    },
  };
}

/**
 * 限定虚拟 DOM 的更新范围
 */
export const Scope = defineComponent({
  slots: Object as SlotsType<{ default: () => void }>,
  setup(_, { slots }) {
    return () => slots.default();
  },
});

/**
 * 用于高阶组件的接口暴露
 * 合并多个组件的 expose，也可以自定义额外的 expose
 * 可使用扩展运算符，但非函数值也要通过函数调用获取
 */
export function createMergedExpose<T = any>(
  keys: string[],
  ...exposeList: ((() => object) | object)[]
) {
  const result = {} as T;

  for (const key of keys) {
    (result as any)[key] = (...args: any[]) => {
      for (let i = exposeList.length - 1; i >= 0; i--) {
        const expose = exposeList[i];
        const obj = typeof expose === 'function' ? expose() : expose;
        if (obj && key in obj) {
          const value = obj[key];
          if (typeof value === 'function') {
            return obj[key](...args);
          }
          return value;
        }
      }
    };
  }

  return result;
}

/**
 * 如果值为空时展示占位符，否则显示值
 */
export function addNullablePlaceholder<T = unknown>(
  value: T,
  converter?: (value: NonNullable<T>) => any,
) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return (converter ? converter(value) : value) as string;
}

/**
 * 获取 VNode 中的文本
 */
export function getVNodeText(vnode: unknown): string {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return String(vnode);
  }

  if (Array.isArray(vnode)) {
    return vnode.map(getVNodeText).join('');
  }

  if (isObject(vnode)) {
    if (isPlainObject(vnode.children)) {
      return Object.values(vnode.children)
        .map((slot) => getVNodeText(slot))
        .join('');
    }
    return getVNodeText(vnode.children);
  }

  if (isFunction(vnode)) {
    return getVNodeText(vnode());
  }

  return '';
}

/**
 * 批量绑定事件
 *
 * 用于高级组件中，因声明了事件使 attrs 不包含事件而未能绑定事件的场景。
 */
export function bulkBindEvents(emits: Record<string, any>, emit: (...args: any[]) => any) {
  return Object.fromEntries(
    Object.keys(emits).map((name) => {
      return [`on${upperFirst(name)}`, (...args: any[]) => emit(name, ...args)];
    }),
  );
}
