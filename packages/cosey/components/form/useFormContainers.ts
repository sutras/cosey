import { nextTick, onBeforeUnmount, onMounted, shallowReactive, shallowRef } from 'vue';
import { type FormItemProp } from 'element-plus';
import {
  type FormContext,
  type FormInvalidFields,
  type FormValidateChangeReason,
} from './form.api';
import { locateInvalidContainer } from './useFormInvalid';

/** 容器的标识（页签名 / 步骤序号），只用于「按标识找容器」 */
export type FormContainerId = string | number;

/**
 * 表单里「会把字段藏起来」的容器（页签、步骤…）需要登记的一份信息。
 *
 * 之所以要拿到容器的 DOM，是因为判断「某个表单项属于哪个容器」最可靠的方式
 * 就是看它渲染在哪个子树里 —— 不用改 `co-form-item`，动态增删的字段也天然正确。
 */
export interface FormContainerEntry {
  /** 稳定且唯一，用作 `v-for` 的 key（页签名会变、步骤序号会挪位，都不能当 key） */
  uid: string;
  /** 当前标识。允许变化（页签名可以被外部改掉），所以用函数取 */
  id: () => FormContainerId | undefined;
  /** 容器根 DOM，未渲染时返回空 */
  getEl: () => HTMLElement | undefined | null;
  /** 容器内的出错字段数量，由 `useFormContainers` 维护 */
  errorCount: number;
}

export interface UseFormContainersOptions<T extends FormContainerEntry> {
  /** 当前表单上下文；脱离 `co-form` 使用时为 null */
  formContext: FormContext | null;
  /** 是否统计错误（页签徽标 / 步骤状态） */
  enabled: () => boolean;
  /** 校验失败时是否要切到出错容器 */
  switchToInvalid: () => boolean;
  /** 定位到出错容器时回调（页签：切页签；步骤：切步骤） */
  onInvalid: (entry: T) => void;
  /** 某个容器被移除后回调，用于收拾派生状态（比如当前容器失效了要回落） */
  onRemoved?: () => void;
}

/** 标识归一化：`el-tabs` 的 name 允许为空，而我们需要一个稳定的字符串键 */
export const toContainerKey = (id?: FormContainerId) =>
  id === undefined || id === null ? '' : String(id);

/**
 * 管理「同一层级的一组容器」，供 `co-form-tabs` / `co-form-steps` 这类组件使用。
 *
 * 提供四件事：
 * 1. 注册 / 注销容器，并按 **DOM 顺序** 排列（注册顺序靠不住，见 `refreshOrder`）；
 * 2. 统计每个容器里的出错字段数量；
 * 3. 整体校验失败时定位到第一个含出错字段的容器；
 * 4. 只校验某个容器内的字段。
 */
export function useFormContainers<T extends FormContainerEntry>(
  options: UseFormContainersOptions<T>,
) {
  const { formContext } = options;

  /** 注册表，顺序 = 注册顺序，不是显示顺序 */
  const entries = shallowReactive<T[]>([]);

  /** 按显示顺序排好的容器。用 shallowRef：不要深代理，容器上可能挂着组件定义之类的东西 */
  const orderedEntries = shallowRef<T[]>([]);

  /**
   * 按文档顺序排列容器。
   * 不能用注册顺序：`v-if` 条件渲染的容器是在条件成立时才注册的，
   * `v-for` 重排也不会让已挂载的组件重新注册 —— 两种情况都会让注册顺序和视觉顺序不一致。
   */
  const sortByDom = (list: T[]) => {
    return [...list].sort((a, b) => {
      const elA = a.getEl();
      const elB = b.getEl();

      if (!elA || !elB || elA === elB) {
        return 0;
      }

      return elA.compareDocumentPosition(elB) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
  };

  const refreshOrder = () => {
    orderedEntries.value = sortByDom(entries);
  };

  const findEntry = (id?: FormContainerId) =>
    id === undefined || id === null
      ? undefined
      : orderedEntries.value.find((entry) => toContainerKey(entry.id()) === toContainerKey(id));

  /** 取某个容器内的所有表单项 prop —— 校验范围可以因此限在这个容器 */
  const getEntryFields = (entry?: T) => {
    const el = entry?.getEl();

    if (!el) {
      return [] as FormItemProp[];
    }

    return (formContext?.getFields() ?? [])
      .filter((field) => field.$el && el.contains(field.$el))
      .map((field) => field.prop)
      .filter((prop): prop is FormItemProp => prop !== undefined && prop !== null);
  };

  /**
   * 校验某个容器内的字段，不通过时返回 false。
   *
   * 直接收容器条目（而不是标识）：页签的标识是 name、步骤的标识是 DOM 顺序，
   * 调用方手上一般已经有条目了，按标识再查一次反而多一层（步骤连查都查不到）。
   *
   * ⚠️ 通知用 `validate-field` 而不是 `validate`：`validate` 会让容器切到
   * 「第一个含出错字段的容器」，如果别处还留着历史错误，用户点「下一步」就会被拽走。
   * 用 `validate-field` 只同步错误状态，定位由调用方自己决定（比如滚动到当前容器里的错误）。
   */
  const validateEntry = async (entry?: T) => {
    const targetProps = getEntryFields(entry);

    if (!formContext || !targetProps.length) {
      return true;
    }

    return formContext.validateFields(targetProps, 'validate-field');
  };

  /**
   * 把每个容器的错误数量刷新一遍。
   *
   * 计数写在**容器自己身上**，而不是一张以标识为 key 的表里 —— 容器卸载时数据跟着走，
   * 不会留下「同名容器重新挂上来就亮一下」的幽灵数据。
   */
  const syncErrorCounts = (invalidFields: FormInvalidFields) => {
    const invalidProps = Object.keys(invalidFields);
    const invalidFieldsInForm = (formContext?.getFields() ?? []).filter(
      (field) => field.$el && invalidProps.includes(field.propString),
    );

    entries.forEach((entry) => {
      const el = options.enabled() ? entry.getEl() : undefined;

      entry.errorCount = el
        ? invalidFieldsInForm.filter((field) => el.contains(field.$el as Node)).length
        : 0;
    });
  };

  const handleValidateChange = (
    invalidFields: FormInvalidFields,
    reason: FormValidateChangeReason,
  ) => {
    syncErrorCounts(invalidFields);

    // 只有「用户主动校验」才切容器。打字时的实时校验（reason = field）如果也切，
    // 用户每填错一格就被拽走，反而更难填
    if (reason !== 'validate' || !options.switchToInvalid()) {
      return;
    }

    const target = locateInvalidContainer(
      invalidFields,
      formContext?.getFields() ?? [],
      orderedEntries.value.map((entry) => ({ value: entry, getEl: entry.getEl })),
    );

    if (target) {
      options.onInvalid(target);
    }
  };

  /**
   * 注册一个容器，返回取消注册的函数。
   *
   * `onBeforeUnmount` 里调用取消函数，所以**移除路径**要在这里一并收拾干净：
   * 登记表会自愈，但「当前容器 / 按容器缓存」这类派生状态不会 —— 交给 `onRemoved`。
   */
  const addEntry = (entry: T) => {
    // 只做浅代理：`errorCount` 需要能触发更新，但容器上挂的 props / 组件定义不该被深包装
    const container = shallowReactive(entry);

    entries.push(container);
    // 注册发生在子组件 setup 阶段，此时 DOM 还没挂载，拿不到排序依据
    nextTick(refreshOrder);

    return () => {
      const index = entries.indexOf(container);

      if (index > -1) {
        entries.splice(index, 1);
      }

      nextTick(() => {
        refreshOrder();
        options.onRemoved?.();
      });
    };
  };

  let cancelValidateChange: (() => void) | undefined;

  onMounted(() => {
    refreshOrder();
    cancelValidateChange = formContext?.onValidateChange(handleValidateChange);
  });

  onBeforeUnmount(() => {
    cancelValidateChange?.();
  });

  return {
    /** 注册表（注册顺序） */
    entries,
    /** 按显示顺序排好的容器 */
    orderedEntries,
    addEntry,
    refreshOrder,
    findEntry,
    getEntryFields,
    validateEntry,
  };
}
