import { InjectionKey, onMounted, provide, shallowRef } from 'vue';

export interface PopoverContainerContext {
  popoverWrapper: HTMLDivElement;
}

export const popoverContainerContextKey = Symbol(
  'editorContext',
) as InjectionKey<PopoverContainerContext>;

export function usePopoverContainer() {
  const popoverContainer = document.createElement('div');
  const popoverWrapper = document.createElement('div');
  popoverContainer.append(popoverWrapper);
  Object.assign(popoverContainer.style, {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  });
  Object.assign(popoverWrapper.style, {
    pointerEvents: 'auto',
  });

  const mountPoint = shallowRef<HTMLDivElement>();

  onMounted(() => {
    mountPoint.value!.append(popoverContainer);
  });

  provide(popoverContainerContextKey, {
    popoverWrapper,
  });

  return {
    mountPoint,
  };
}
