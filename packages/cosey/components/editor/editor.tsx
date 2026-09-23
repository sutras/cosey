import { computed, defineComponent, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import Toolbar from './containers/toolbar';
import FloatFormatToolbar from './containers/float-format-toolbar';
import BlockMenu from './containers/block-menu';
import ButtonGroup from './ui/button-group';
import ButtonGroupList from './ui/button-group-list';
import ContentPlaceholder from './contents/content-placeholder';
import { renderEditorTools } from './tool-renderers';

import { editorProps, editorSlots, editorEmits } from './editor.api';
import { createEditorExpose } from './expose';
import { parseEditorFeatures, parseEditorToolbar } from './tools';
import { createBem } from '../../utils';
import { useFocus } from './hooks/useFocus';
import { useImageDrop } from './hooks/useImageDrop';
import { useEditorValue } from './hooks/useEditorValue';
import { useEditorNodeViews } from './node-views';
import { EditorFacade } from './pm/editor';
import { editorContextKey } from './pm/context';
import { buildPlugins } from './pm/plugins';
import { bumpViewVersion } from './pm/reactive-view';
import { schema } from './pm/schema';
import { useFormDisabled, useFormItem } from 'element-plus';

export default defineComponent({
  name: 'CoEditor',
  props: editorProps,
  slots: editorSlots,
  emits: editorEmits,
  setup(props, { emit, expose }) {
    const bem = createBem('editor');

    const { isFocus, onFocus, onBlur } = useFocus();

    const { formItem } = useFormItem();
    const disabled = useFormDisabled();

    const facade = new EditorFacade();

    // 工具栏通过 inject 拿编辑器实例，必须先于 node view 的装配 provide
    provide(editorContextKey, facade);

    // `features` 决定「能用什么」，浮动工具条与块级菜单也要跟着收敛；固定工具栏再与
    // `toolbar` 取交集，得到最终显示哪些按钮、怎么分组。
    const enabledTools = computed(() => parseEditorFeatures(props.features));
    const toolbarGroups = computed(() => parseEditorToolbar(props.toolbar, enabledTools.value));

    watch(
      () => props.features,
      () => facade.setTools(props.features),
      { immediate: true },
    );

    const { placeholderVisible, onValueChange, syncFromProps } = useEditorValue(
      facade,
      props,
      emit,
    );
    const { handlePaste, handleDrop } = useImageDrop(facade);

    const nodeViews = useEditorNodeViews(facade);

    const editorState = EditorState.create({
      schema,
      doc: schema.node('doc', null, [schema.nodes.paragraph.create()]),
      // 快捷键按 features 收敛：传的是取值函数而不是快照，features 变化后无需重建 state
      plugins: buildPlugins((tool) => facade.hasTool(tool)),
    });

    const view = new EditorView(null, {
      state: editorState,
      // 内容区的 class 交给 ProseMirror 统一管理：columnResizing 会往编辑区追加
      // resize-cursor，自己往 view.dom 上挂 class 会被这一步覆盖掉。
      attributes: { class: bem.e('content') },
      editable: () => !(props.readonly || disabled.value),
      nodeViews,
      dispatchTransaction(tr) {
        const next = view.state.apply(tr);
        view.updateState(next);
        bumpViewVersion();
        facade.version.value++;
        onValueChange();
      },
      handlePaste,
      handleDrop,
    });

    facade.view = view;
    // 灌入初始值要走事务，所以放在 view 就绪之后
    syncFromProps();

    watch(
      [() => props.readonly, disabled],
      () => {
        facade.editable.value = !(props.readonly || disabled.value);
        view.setProps({
          editable: () => !(props.readonly || disabled.value),
        });
      },
      { immediate: true },
    );

    const wrapperElement = ref<HTMLDivElement>();

    onMounted(() => {
      const mount = wrapperElement.value;
      if (mount) {
        mount.appendChild(view.dom);
        view.dom.addEventListener('focus', onFocus);
        view.dom.addEventListener('blur', onBlur);
      }
    });

    onBeforeUnmount(() => {
      view.dom.removeEventListener('focus', onFocus);
      view.dom.removeEventListener('blur', onBlur);
      view.destroy();
    });

    expose(createEditorExpose(facade));

    return () => {
      const showToolbar = !props.readonly && !disabled.value && props.mode !== 'float';
      const showFloatToolbar = !props.readonly && !disabled.value && props.mode === 'float';

      return (
        <div
          class={[
            bem.b(),
            bem.is('error', formItem?.validateState === 'error'),
            bem.is('disabled', disabled.value),
          ]}
        >
          {showToolbar && toolbarGroups.value.length > 0 && (
            <Toolbar>
              <ButtonGroupList>
                {toolbarGroups.value.map((group) => (
                  <ButtonGroup key={group.join(',')}>{renderEditorTools(group)}</ButtonGroup>
                ))}
              </ButtonGroupList>
            </Toolbar>
          )}
          <div class={[bem.e('container'), bem.is('focus', isFocus.value)]}>
            {showFloatToolbar && (
              <>
                <FloatFormatToolbar />
                <BlockMenu />
              </>
            )}
            <div
              ref={wrapperElement}
              class={bem.e('wrapper')}
              style={{
                height: props.height,
                maxHeight: props.maxHeight,
              }}
            >
              <ContentPlaceholder visible={placeholderVisible.value} text={props.placeholder} />
            </div>
          </div>
        </div>
      );
    };
  },
});
