import { computed, defineComponent, onBeforeUnmount, ref, type PropType } from 'vue';
import { type Node as PMNode } from 'prosemirror-model';
import { NodeSelection } from 'prosemirror-state';
import { type EditorView } from 'prosemirror-view';
import { useObjectUrl } from '../../../hooks';
import { createBem } from '../../../utils';
import Resize from './base/resize';
import Upload from './base/upload';
import { getUploadFile, clearUploadFile } from '../pm/upload-cache';

export default defineComponent({
  name: 'CoEditorContentImage',
  props: {
    node: { type: Object as PropType<PMNode>, required: true },
    view: { type: Object as PropType<EditorView>, required: true },
    getPos: { type: Function as PropType<() => number | undefined>, required: true },
    selected: { type: Boolean },
    registerEl: {
      type: Function as PropType<(el: HTMLElement | null) => void>,
      required: true,
    },
  },
  setup(props) {
    const bem = createBem('editor-content-image');

    const fileId = computed(() => {
      const title = props.node.attrs.title as string | null;
      return title && title.startsWith('file:') ? title : null;
    });

    const file = computed(() => (fileId.value ? getUploadFile(fileId.value) : undefined));
    const objectUrl = useObjectUrl(() => file.value);
    const mergedUrl = computed(() => (props.node.attrs.src as string) || objectUrl.value);

    const select = () => {
      const pos = props.getPos();
      if (pos == null) return;

      props.view.dispatch(
        props.view.state.tr.setSelection(NodeSelection.create(props.view.state.doc, pos)),
      );
      props.view.focus();
    };

    const imgRef = ref<HTMLImageElement | null>(null);

    const onResize = ({ width, height }: { width: number; height: number }) => {
      if (imgRef.value) {
        imgRef.value.width = width;
        imgRef.value.height = height;
      }
    };

    const onResizeEnd = ({ width, height }: { width: number; height: number }) => {
      const pos = props.getPos();
      if (pos == null) return;
      const tr = props.view.state.tr.setNodeMarkup(pos, undefined, {
        ...props.node.attrs,
        width,
        height,
      });
      tr.setSelection(NodeSelection.create(tr.doc, pos));
      props.view.dispatch(tr);
    };

    const onSuccess = (url: string) => {
      const pos = props.getPos();
      if (pos == null) return;

      props.view.dispatch(
        props.view.state.tr.setNodeMarkup(pos, undefined, {
          ...props.node.attrs,
          src: url,
          title: null,
        }),
      );

      if (fileId.value) {
        clearUploadFile(fileId.value);
      }
    };

    onBeforeUnmount(() => {
      if (fileId.value) {
        clearUploadFile(fileId.value);
      }
    });

    return () => {
      return (
        <span
          ref={(el) => props.registerEl(el as HTMLElement | null)}
          class={[bem.b(), bem.is('active', props.selected)]}
          onClick={select}
        >
          <span class={bem.e('wrapper')}>
            <img
              ref={(el) => (imgRef.value = el as HTMLImageElement | null)}
              src={mergedUrl.value}
              width={props.node.attrs.width ?? undefined}
              height={props.node.attrs.height ?? undefined}
            />
            <Resize visible={props.selected} onResize={onResize} onResizeEnd={onResizeEnd} />
            {file.value && <Upload file={file.value} onSuccess={onSuccess} />}
          </span>
        </span>
      );
    };
  },
});
