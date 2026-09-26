<template>
  <component :is="template"></component>
</template>

<script setup lang="tsx">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElMenu, ElMenuItem, ElMenuItemGroup, ElSubMenu } from 'element-plus';
import { type MenuItem } from '../../router';
import { useLayoutStore } from '../../store';
import { defineTemplate } from '../../utils';
import { Icon } from '../../components';
import { createBem } from '../../utils';
import { useRouteNavigate } from '../use-route-navigate';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'CoLayoutMenu',
});

const props = withDefaults(
  defineProps<{
    mode?: 'horizontal' | 'vertical';
  }>(),
  {
    mode: 'vertical',
  },
);

const bem = createBem('layout-menu');

const route = useRoute();
const navigate = useRouteNavigate();

const layoutStore = useLayoutStore();

const mode = computed(() => {
  if (!layoutStore.isMobile && props.mode === 'horizontal') {
    return 'horizontal';
  }
  return 'vertical';
});

const collapse = computed(() => {
  return !layoutStore.isMobile && mode.value === 'vertical' && layoutStore.collapse;
});

const onMenuItemClick = (item: MenuItem) => {
  if (layoutStore.isMobile) {
    layoutStore.sidebarVisible = false;
  }

  if (item._externalLink) {
    window.open(item.path, '_blank');
  } else {
    navigate(item.name);
  }
};

function renderMenu(menuItems: MenuItem[]) {
  function renderSubMenu(menuItems: MenuItem[]) {
    return menuItems.map((item) => {
      const iconVNode = () =>
        item.icon && (
          <div
            class={bem.e('icon')}
            style={{
              margin: collapse.value ? 0 : undefined,
            }}
          >
            <Icon name={item.icon} />
          </div>
        );
      const titleVNode = () => {
        const title = t(item.title ?? '');
        return (
          <span class={bem.e('title')} title={title}>
            {title}
          </span>
        );
      };

      if (item.children && item.children.length > 0) {
        const slots = {
          title: () => [iconVNode(), titleVNode()],
          default: () => renderSubMenu(item.children!),
        };
        if (item.type === 'group') {
          return <ElMenuItemGroup v-slots={slots}></ElMenuItemGroup>;
        }
        return <ElSubMenu index={item.name} v-slots={slots}></ElSubMenu>;
      }

      const menuRoute = item.route;
      const active =
        menuRoute.children?.length &&
        menuRoute.meta.hideChildrenInMenu &&
        route.matched.some((item) => item.name === menuRoute.name);

      return (
        <ElMenuItem
          key={item.name}
          index={item.name}
          class={bem.is('active', active)}
          onClick={() => onMenuItemClick(item)}
          v-slots={{
            title: titleVNode,
            default: iconVNode,
          }}
        ></ElMenuItem>
      );
    });
  }

  return (
    <ElMenu
      unique-opened
      default-active={route.name}
      mode={mode.value}
      collapse={collapse.value}
      style={{ '--el-menu-horizontal-height': '100%' }}
      class={[bem.b(), bem.is(layoutStore.menuType)]}
    >
      {{ default: () => renderSubMenu(menuItems) }}
    </ElMenu>
  );
}

const template = defineTemplate(() => {
  return renderMenu(layoutStore.defaultMenus);
});
</script>
