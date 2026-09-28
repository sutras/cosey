import { computed, ref, watch } from 'vue';

/**
 * @deprecated 直接改用 vue 内置的 `useModel(props, 'modelValue')`。
 *
 * `useModel`（vue 3.4+）覆盖了这里的两件事，而且更准：
 *
 * - **父级绑了 `v-model`** → 受控，等父级回写；本 hook 不论父级绑没绑都自己存一份
 *   `privateValue`，会和 prop 短暂不一致。
 * - **父级没绑** → `useModel` 会自动退回组件内部状态，所以「组件内部改值」照样生效。
 * - prop 同步用 `watchSyncEffect`（**同步**），这里用的是默认 `flush: 'pre'` 的 `watch`，
 *   父级改值当拍读到的是旧值。
 * - 额外白拿 `v-model.trim` / `v-model.number` 修饰符与 `mergeDefaults` 式的 `get` / `set`。
 *
 * ⚠️ 代价：`useModel` 依赖 `getCurrentInstance()`，只能在 `setup()` 里**同步**调用；
 * 本 hook 没有这个限制。这也是它至今保留在这里的原因（`cosey` 是已发布包，
 * 删公开导出要等大版本）。
 */
export function useTwoWayBinding<P extends Record<string, any>, T, Key extends keyof P>(
  props: P,
  emit: (...args: any[]) => any,
  valueName: Key,
) {
  const privateValue = ref<T | undefined>(props[valueName]);

  watch(
    () => props[valueName],
    () => {
      privateValue.value = props[valueName];
    },
  );

  const value = computed({
    get() {
      return privateValue.value;
    },
    set(value: T) {
      privateValue.value = value;
      emit(`update:${valueName as string}`, value);
    },
  });

  return value;
}
