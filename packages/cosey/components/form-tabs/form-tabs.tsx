import { defineComponent, onBeforeUnmount, onMounted, provide, useModel } from 'vue';
import { ElTabs, type TabPaneName } from 'element-plus';
import { reactiveOmit } from '@vueuse/core';
import { toContainerKey, useFormContainers, useFormContext } from '../form';
import { createBem } from '../../utils';
import {
  type FormTabName,
  type FormTabPanelEntry,
  type FormTabsContext,
  type FormTabsExpose,
  formTabsContextSymbol,
  formTabsEmits,
  formTabsProps,
  formTabsSlots,
} from './form-tabs.api';

export default defineComponent({
  name: 'CoFormTabs',
  inheritAttrs: false,
  props: formTabsProps,
  slots: formTabsSlots,
  emits: formTabsEmits,
  setup(props, { attrs, emit, slots, expose }) {
    const bem = createBem('form-tabs');

    const formContext = useFormContext();

    const elTabsProps = reactiveOmit(
      props,
      'switchToInvalid',
      'resetOnOpen',
      'showBadge',
      'beforeLeave',
    );

    /**
     * 当前激活的页签。用 vue 内置的 `useModel`：
     * 父级绑了 `v-model` 时是受控的（由父级回写），没绑（或只单向传 `model-value`）时
     * 自动退回组件内部状态 —— `switchToInvalid` / `resetOnOpen` 这类**内部**切换
     * 在两种用法下都成立。
     */
    const innerValue = useModel(props, 'modelValue');

    /** 程序化切换页签（自动切到出错页签 / 打开复位），不经过 el-tabs 的 before-leave */
    const activate = (name?: FormTabName) => {
      if (name === undefined || toContainerKey(name) === toContainerKey(innerValue.value)) {
        return;
      }

      innerValue.value = name;
    };

    /**
     * 当前激活的页签不存在了就落到第一个仍存在的页签。
     *
     * 不处理的话 el-tabs 会停在那个已经消失的名字上：没有任何页签是 `is-active`，
     * 其余 pane 一律 `display: none` —— 用户看到的是**整个表单体一片空白**，
     * 而且只有「再点一次提交」（`switchToInvalid` 把它拉回来）才能恢复。
     *
     * ⚠️ 只在**移除**时调用，**注册时不能调**：多个页签是逐个 setup 注册的，
     * 第一个注册时其余还没进来，会把这个「暂时找不到的激活页签」误判成失效，
     * 把外部 `v-model` 指定的初始页签冲掉。
     */
    const ensureActivePanel = () => {
      if (
        orderedEntries.value.some(
          (entry) => toContainerKey(entry.id()) === toContainerKey(innerValue.value),
        )
      ) {
        return;
      }

      activate(orderedEntries.value[0]?.id());
    };

    const { orderedEntries, addEntry, refreshOrder, findEntry, validateEntry } =
      useFormContainers<FormTabPanelEntry>({
        formContext,
        enabled: () => props.showBadge,
        switchToInvalid: () => props.switchToInvalid,
        onInvalid: (entry) => activate(entry.id()),
        // 页签被移除：当前激活页签失效就回落（错误计数跟着条目一起消失，不用单独清）
        onRemoved: ensureActivePanel,
      });

    const getPanelState = (name: FormTabName) => ({
      errorCount: findEntry(name)?.errorCount ?? 0,
    });

    provide<FormTabsContext>(formTabsContextSymbol, { addPanel: addEntry, getPanelState });

    /** 校验当前页签；不通过时 form 层已经把出错字段滚进视口了 */
    const validateCurrent = () => validateEntry(findEntry(innerValue.value));

    const handleOpen = () => {
      if (!props.resetOnOpen) {
        return;
      }

      refreshOrder();
      activate(orderedEntries.value[0]?.id());
    };

    const handleBeforeLeave = async (newName: TabPaneName, oldName: TabPaneName) => {
      if (props.beforeLeave) {
        const userResult = await props.beforeLeave(newName, oldName);

        if (userResult === false) {
          return false;
        }
      }

      return true;
    };

    let cancelOpen: (() => void) | undefined;

    onMounted(() => {
      // 没有初始值时显式落到第一个页签，让内部状态和 el-tabs 保持一致
      if (innerValue.value === undefined) {
        activate(orderedEntries.value[0]?.id());
      }

      cancelOpen = formContext?.onOpen(handleOpen);
    });

    onBeforeUnmount(() => {
      cancelOpen?.();
    });

    expose<FormTabsExpose>({
      get activeName() {
        return innerValue.value;
      },
      activate,
      validateCurrent,
      getTabNames: () => orderedEntries.value.map((entry) => entry.id()),
    });

    return () => {
      const { class: attrsClass, style: attrsStyle, ...restAttrs } = attrs as Record<string, any>;

      return (
        <div class={[bem.b(), attrsClass]} style={attrsStyle}>
          <ElTabs
            {...restAttrs}
            {...elTabsProps}
            modelValue={innerValue.value}
            beforeLeave={handleBeforeLeave}
            onTabClick={(pane, event) => emit('tabClick', pane, event)}
            onTabChange={(name) => emit('tabChange', name)}
            onEdit={(paneName, action) => emit('edit', paneName, action)}
            onTabRemove={(name) => emit('tabRemove', name)}
            onTabAdd={() => emit('tabAdd')}
            {...{
              'onUpdate:modelValue': (value: FormTabName) => {
                innerValue.value = value;
              },
            }}
          >
            {slots.default?.({})}
          </ElTabs>
        </div>
      );
    };
  },
});
