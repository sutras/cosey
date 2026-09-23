import { defineComponent, type PropType } from 'vue';
import { type Node as PMNode } from 'prosemirror-model';
import { NodeSelection } from 'prosemirror-state';
import { type EditorView } from 'prosemirror-view';
import { createBem } from '../../../utils';
import Resize from './base/resize';
import { ref } from 'vue';

export default defineComponent({
  name: 'CoEditorContentVideo',
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
    const bem = createBem('editor-content-video');

    const select = () => {
      const pos = props.getPos();
      if (pos == null) return;

      props.view.dispatch(
        props.view.state.tr.setSelection(NodeSelection.create(props.view.state.doc, pos)),
      );
      props.view.focus();
    };

    const videoRef = ref<HTMLVideoElement | null>(null);

    const onResize = ({ width, height }: { width: number; height: number }) => {
      if (videoRef.value) {
        videoRef.value.width = width;
        videoRef.value.height = height;
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

    return () => {
      return (
        <span
          ref={(el) => props.registerEl(el as HTMLElement | null)}
          class={[bem.b(), bem.is('active', props.selected)]}
          onClick={select}
        >
          <span class={bem.e('wrapper')}>
            <video
              ref={(el) => (videoRef.value = el as HTMLVideoElement | null)}
              src={props.node.attrs.src ?? undefined}
              width={props.node.attrs.width ?? 300}
              height={props.node.attrs.height ?? undefined}
              controls
            />
            <Resize visible={props.selected} onResize={onResize} onResizeEnd={onResizeEnd} />
          </span>
        </span>
      );
    };
  },
});
