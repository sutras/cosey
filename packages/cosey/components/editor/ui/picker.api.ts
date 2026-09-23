import type { InjectionKey, Ref } from 'vue';

export const pickerContextKey = Symbol('picker') as InjectionKey<{
  triggerTarget: Ref<HTMLElement | undefined>;
}>;
