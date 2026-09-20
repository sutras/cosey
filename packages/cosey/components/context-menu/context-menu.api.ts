import { type SlotsType, type ExtractPropTypes, type Ref, type PropType } from 'vue';

export type ContextMenuTrigger = 'contextmenu' | 'manual' | 'click';

export type ContextMenuPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end';

/** 虚拟引用元素：只需提供 getBoundingClientRect，用于把菜单定位到某个锚点旁。 */
export interface ContextMenuVirtualRef {
  getBoundingClientRect: () => DOMRect;
}

export const contextMenuProps = {
  disabled: {
    type: Boolean,
  },
  /**
   * 触发方式：
   * - `contextmenu`：在 reference 元素上点击鼠标右键打开（默认）。
   * - `click`：在 reference 元素上点击左键打开。
   * - `manual`：由外部调用 `open()` 手动打开（可配合 `virtual-ref` 定位到锚点）。
   */
  trigger: {
    type: String as PropType<ContextMenuTrigger>,
    default: 'contextmenu',
  },
  /** 手动/点击模式下用于定位菜单的虚拟引用元素（锚点）。 */
  virtualRef: {
    type: Object as PropType<ContextMenuVirtualRef | null>,
    default: null,
  },
  /** 菜单相对 reference 的放置位置，仅在 `virtual-ref` 定位时生效。 */
  placement: {
    type: String as PropType<ContextMenuPlacement>,
    default: 'right-start',
  },
  /** 菜单与 reference 之间的偏移量（px）。 */
  offset: {
    type: Number,
    default: 0,
  },
  /**
   * 关闭时是否仅隐藏菜单而不卸载其内容。
   * 菜单项子树上挂有待交互浮层（如插入图片的弹窗、表格网格选择器）时需要开启，
   * 否则菜单关闭会连带卸载这些浮层。
   */
  persistent: {
    type: Boolean,
  },
  /**
   * 打开时是否锁定页面滚动。右键菜单等模态场景默认开启；
   * 锚定在页面元素上的非模态菜单（如编辑器块级菜单）应关闭——锁滚动会给 body
   * 设置补偿滚动条宽度的 width + overflow hidden，导致内容重排、锚点坐标变化，
   * 菜单和锚定元素会整体跳一下。
   */
  lockScroll: {
    type: Boolean,
    default: true,
  },
};

export type ContextMenuProps = ExtractPropTypes<typeof contextMenuProps>;

export interface ContextMenuSlots {
  default: {};
  reference: {};
}

export const contextMenuSlots = Object as SlotsType<ContextMenuSlots>;

export const contextMenuEmits = {
  command: (value: any) => value || true,
  open: () => true,
  close: () => true,
};

export type ContextMenuEmits = typeof contextMenuEmits;

export interface ContextMenuExpose {
  open: (x?: number, y?: number) => void;
  close: () => void;
}

export interface ContextMenuContext {
  withIcon: Ref<boolean>;
  addItem: (item: ContextMenuItemContext) => void;
  removeItem: (item: ContextMenuItemContext) => void;
  select: (command: any) => void;
  items: Ref<ContextMenuItemContext[]>;
}

export const contextMenuContextSymbol = Symbol('contextMenu');

export interface ContextMenuItemContext {
  show: () => void;
  hide: () => void;
  icon: boolean;
}
