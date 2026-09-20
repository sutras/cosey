import { enhanceComponent, type EnhancedComponent } from '../utils';
import ContextMenu from './context-menu';
import ContextMenuItem from './context-menu-item';
import ContextSubMenu from './context-sub-menu';
import Content from './content';

export * from './context-menu.api';
export * from './context-menu-item.api';
export * from './context-sub-menu.api';
export * from './content.api';

const _ContextMenuItem: EnhancedComponent<typeof ContextMenuItem> =
  enhanceComponent(ContextMenuItem);
const _ContextSubMenu: EnhancedComponent<typeof ContextSubMenu> = enhanceComponent(ContextSubMenu);
const _ContextMenu: EnhancedComponent<typeof ContextMenu> = enhanceComponent(ContextMenu);

export {
  _ContextMenuItem as ContextMenuItem,
  _ContextSubMenu as ContextSubMenu,
  _ContextMenu as ContextMenu,
};
export { Content as ContextMenuContent };
export default _ContextMenu;
