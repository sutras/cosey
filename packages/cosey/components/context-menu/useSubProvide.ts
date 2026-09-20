import { inject, provide, ref } from 'vue';

interface SubInstance {
  show: () => void;
  hide: () => void;
}

interface SubContext {
  addSub: (sub: SubInstance) => void;
  removeSub: (sub: SubInstance) => void;
  showSub: (sub: SubInstance) => void;
  hideSub: (sub: SubInstance) => void;
  /** 根菜单是否 persistent（关闭仅隐藏不卸载），子菜单跟随 */
  persistent: boolean;
}

export const subContextSymbol = Symbol('subContext');

export function useSubProvide(options?: { persistent?: boolean }) {
  const subs = ref<SubInstance[]>([]);

  const addSub = (sub: SubInstance) => {
    if (!subs.value.includes(sub)) {
      subs.value.push(sub);
    }
  };

  const removeSub = (sub: SubInstance) => {
    const index = subs.value.indexOf(sub);
    if (index !== -1) {
      subs.value.splice(index, 1);
    }
  };

  const showSub = (sub: SubInstance) => {
    sub.show();
    subs.value.forEach((item) => {
      if (item !== sub) {
        item.hide();
      }
    });
  };

  const hideSub = (sub: SubInstance) => {
    sub.hide();
  };

  const context: SubContext = {
    addSub,
    removeSub,
    showSub,
    hideSub,
    persistent: options?.persistent ?? false,
  };

  provide<SubContext>(subContextSymbol, context);

  /** 收起当前层级的所有子菜单（根菜单关闭时调用，防止 persistent 模式下浮层残留） */
  const hideAll = () => {
    subs.value.forEach((sub) => sub.hide());
  };

  return { hideAll };
}

export function useSubInject() {
  return inject<SubContext>(subContextSymbol)!;
}
