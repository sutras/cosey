import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
} from 'vue';
import { EditorState, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import Toolbar from './toolbar';
import ButtonGroup from './button-group';
import FormatMark from './formats/format-mark';
import FormatHeading from './formats/format-heading';
import FormatHistory from './formats/format-history';
import FormatBlockQuote from './formats/format-block-quote';
import FormatTable from './formats/format-table';
import FormatFont from './formats/format-font';
import FormatSize from './formats/format-size';
import FormatColor from './formats/format-color';
import FormatBackground from './formats/format-background';
import FormatIndent from './formats/format-indent';
import FormatAlign from './formats/format-align';
import FormatList from './formats/format-list';
import FormatClear from './formats/format-clear';
import FormatSource from './formats/format-source';
import FormatLink from './formats/format-link';
import FormatCodeBlock from './formats/format-code-block';
import FormatImage from './formats/format-image';
import FormatVideo from './formats/format-video';
import FormatFormula from './formats/format-formula';

import ContentImage from './contents/content-image';
import ContentVideo from './contents/content-video';
import ContentFormula from './contents/content-formula';
import ContentCodeBlock from './contents/content-code-block';
import ContentTable from './contents/content-table';
import ContentPlaceholder from './contents/content-placeholder';

import { editorProps, editorSlots, editorEmits } from './editor.api';
import { createBem, debugWarn, isImageUrl } from '../../utils';
import { useFocus } from './hooks/useFocus';
import { EditorFacade } from './pm/editor';
import { editorContextKey } from './pm/context';
import { buildPlugins } from './pm/plugins';
import { bumpViewVersion } from './pm/reactive-view';
import { vueNodeView, type NodeViewProvides } from './pm/node-view';
import { schema } from './pm/schema';
import { localeContextKey } from '../../hooks';
import { injectUploadConfig, uploadContextKey } from '../../config/upload';
import { CHANGE_EVENT, useFormDisabled, useFormItem } from 'element-plus';
import ButtonGroupList from './button-group-list';
import {
  RtiAlignCenter,
  RtiAlignJustify,
  RtiAlignLeft,
  RtiAlignRight,
  RtiBold,
  RtiBulletList,
  RtiIndentDecrease,
  RtiIndentIncrease,
  RtiInlineCode,
  RtiItalic,
  RtiOrderedList,
  RtiStrikethrough,
  RtiSubscript,
  RtiSuperscript,
  RtiUnderline,
} from 'richtext-icons';

export default defineComponent({
  name: 'CoEditor',
  props: editorProps,
  slots: editorSlots,
  emits: editorEmits,
  setup(props, { emit }) {
    const bem = createBem('editor');

    const { isFocus, onFocus, onBlur } = useFocus();

    const { formItem } = useFormItem();
    const disabled = useFormDisabled();

    const facade = new EditorFacade();

    // Provide before building node views, so the toolbar can inject it.
    provide(editorContextKey, facade);

    // Node views render outside the component tree, so re-provide the
    // ancestor-level context they depend on (locale, upload).
    const nodeViewProvides: NodeViewProvides = [
      [editorContextKey, facade],
      [localeContextKey, inject(localeContextKey, ref())],
      [uploadContextKey, injectUploadConfig()],
    ];

    const onValueChange = () => {
      const nextValue = facade.getContent();
      if (nextValue !== currentValue) {
        currentValue = nextValue;
        emit('update:modelValue', currentValue);
        emit('change', currentValue);
      }
    };

    const editorState = EditorState.create({
      schema,
      doc: schema.node('doc', null, [schema.nodes.paragraph.create()]),
      plugins: buildPlugins(),
    });

    const view = new EditorView(null, {
      state: editorState,
      // 内容区的 class 交给 ProseMirror 统一管理：columnResizing 会往编辑区追加
      // resize-cursor，自己往 view.dom 上挂 class 会被这一步覆盖掉。
      attributes: { class: bem.e('content') },
      editable: () => !(props.readonly || disabled.value),
      nodeViews: {
        image: vueNodeView(ContentImage, nodeViewProvides),
        video: vueNodeView(ContentVideo, nodeViewProvides),
        formula: vueNodeView(ContentFormula, nodeViewProvides),
        code_block: vueNodeView(ContentCodeBlock, nodeViewProvides),
        table: vueNodeView(ContentTable, nodeViewProvides),
      },
      dispatchTransaction(tr) {
        const next = view.state.apply(tr);
        view.updateState(next);
        bumpViewVersion();
        facade.version.value++;
        onValueChange();
      },
      handlePaste(_editorView, event) {
        const data = event.clipboardData;
        if (!data) return false;

        const imageFiles = Array.from(data.files || []).filter((file) =>
          file.type.startsWith('image/'),
        );

        if (imageFiles.length > 0) {
          imageFiles.forEach((file) => facade.insertImage('', file));
          return true;
        }

        if (isImageUrl(data.getData('text/plain'))) {
          facade.insertImage(data.getData('text/plain'));
          return true;
        }

        return false;
      },
      handleDrop(editorView, event) {
        const files = Array.from(event.dataTransfer?.files || []);
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));

        if (imageFiles.length === 0) return false;

        const coords = editorView.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        if (coords) {
          const tr = editorView.state.tr.setSelection(
            TextSelection.near(editorView.state.doc.resolve(coords.pos)),
          );
          editorView.dispatch(tr);
        }

        imageFiles.forEach((file) => facade.insertImage('', file));
        return true;
      },
    });

    facade.view = view;

    // placeholder
    const placeholderVisible = computed(() => {
      void facade.version.value;
      return facade.isDocEmpty();
    });

    // value
    const innerValue = computed(() => props.modelValue ?? '');
    let currentValue = '';

    watch(
      innerValue,
      () => {
        if (innerValue.value !== currentValue) {
          currentValue = innerValue.value;
          facade.setContent(innerValue.value);
        }
      },
      { immediate: true },
    );

    watch(
      () => props.modelValue,
      () => {
        if (props.validateEvent) {
          formItem?.validate?.(CHANGE_EVENT).catch(debugWarn);
        }
      },
    );

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

    return () => {
      return (
        <div
          class={[
            bem.b(),
            bem.is('error', formItem?.validateState === 'error'),
            bem.is('disabled', disabled.value),
          ]}
        >
          {!props.readonly && !disabled.value && (
            <Toolbar>
              <ButtonGroupList>
                <ButtonGroup>
                  <FormatHistory direction="undo" />
                  <FormatHistory direction="redo" />
                </ButtonGroup>
                <ButtonGroup>
                  <FormatHeading />
                </ButtonGroup>
                <ButtonGroup>
                  <FormatFont />
                  <FormatSize />
                </ButtonGroup>
                <ButtonGroup>
                  <FormatMark format="bold" icon={RtiBold} />
                  <FormatMark format="italic" icon={RtiItalic} />
                  <FormatMark format="underline" icon={RtiUnderline} />
                  <FormatMark format="strikethrough" icon={RtiStrikethrough} />
                  <FormatMark format="code" icon={RtiInlineCode} />
                </ButtonGroup>
                <ButtonGroup>
                  <FormatMark format="superscript" icon={RtiSuperscript} />
                  <FormatMark format="subscript" icon={RtiSubscript} />
                </ButtonGroup>
                <ButtonGroup>
                  <FormatColor />
                  <FormatBackground />
                </ButtonGroup>
                <ButtonGroup>
                  <FormatList format="numbered-list" icon={RtiOrderedList} />
                  <FormatList format="bulleted-list" icon={RtiBulletList} />
                </ButtonGroup>
                <ButtonGroup>
                  <FormatIndent delta={-1} icon={RtiIndentDecrease} />
                  <FormatIndent delta={+1} icon={RtiIndentIncrease} />
                </ButtonGroup>
                <ButtonGroup>
                  <FormatAlign format="left" icon={RtiAlignLeft} />
                  <FormatAlign format="center" icon={RtiAlignCenter} />
                  <FormatAlign format="right" icon={RtiAlignRight} />
                  <FormatAlign format="justify" icon={RtiAlignJustify} />
                </ButtonGroup>
                <ButtonGroup>
                  <FormatBlockQuote />
                  <FormatCodeBlock />
                </ButtonGroup>
                <ButtonGroup>
                  <FormatLink />
                  <FormatImage />
                  <FormatVideo />
                  <FormatTable />
                  <FormatFormula />
                </ButtonGroup>
                <ButtonGroup>
                  <FormatClear />
                </ButtonGroup>
                <ButtonGroup>
                  <FormatSource />
                </ButtonGroup>
              </ButtonGroupList>
            </Toolbar>
          )}
          <div class={[bem.e('container'), bem.is('focus', isFocus.value)]}>
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
