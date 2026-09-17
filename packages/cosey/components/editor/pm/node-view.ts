import {
  createVNode,
  defineComponent,
  getCurrentInstance,
  h,
  provide,
  ref,
  render,
  shallowRef,
  type Component,
} from 'vue';
import { type Node as PMNode } from 'prosemirror-model';
import { type EditorView, type NodeView, type ViewMutationRecord } from 'prosemirror-view';

export interface NodeViewProps {
  node: PMNode;
  getNode: () => PMNode;
  view: EditorView;
  getPos: () => number | undefined;
  selected: boolean;
  registerEl: (el: HTMLElement | null) => void;
  registerContent: (el: HTMLElement | null) => void;
}

export type NodeViewProvides = ReadonlyArray<readonly [string | symbol, unknown]>;

export function vueNodeView(
  component: Component,
  provides: NodeViewProvides = [],
): (node: PMNode, view: EditorView, getPos: () => number | undefined) => NodeView {
  const currentInstance = getCurrentInstance();
  const appContext = currentInstance?.appContext ?? null;

  return (node, view, getPos) => {
    let dom: HTMLElement | null = null;
    let contentDOM: HTMLElement | null = null;

    // The node is kept in a shallowRef so Vue doesn't deep-proxy the
    // ProseMirror Node (a deep proxy breaks `nextNode.type === node.type`
    // identity checks and made ProseMirror rebuild the node view on every
    // keystroke). `nodeRef` only changes when attrs/markup change; content
    // changes are rendered by ProseMirror directly into `contentDOM`.
    const nodeRef = shallowRef(node);
    const selected = ref(false);
    // Always-current node, outside Vue reactivity.
    let latestNode = node;

    const App = defineComponent({
      name: 'CoEditorNodeViewHost',
      setup() {
        provides.forEach(([key, value]) => {
          provide(key as string | symbol, value as never);
        });

        return () =>
          h(component, {
            node: nodeRef.value,
            getNode: () => latestNode,
            view,
            getPos,
            selected: selected.value,
            registerEl: (el: HTMLElement | null) => {
              if (el) dom = el;
            },
            registerContent: (el: HTMLElement | null) => {
              if (el) contentDOM = el;
            },
          });
      },
    });

    const host = document.createElement('div');
    const vnode = createVNode(App);
    if (appContext) {
      vnode.appContext = appContext;
    }

    render(vnode, host);

    if (!dom) {
      throw new Error(
        'Editor node view must render a root element and attach `registerEl` as its ref.',
      );
    }

    return {
      dom,
      contentDOM: contentDOM ?? undefined,

      /**
       * Tiptap-style guard: the Vue component re-renders and patches the
       * wrapper DOM (e.g. the table's `class`) on every transaction. Those
       * mutations live outside `contentDOM`, so tell ProseMirror to ignore
       * them — otherwise it marks the node view dirty and destroys/rebuilds it
       * on the next update, which unmounts/remounts the Vue component (and its
       * popover) on every keystroke.
       */
      ignoreMutation(mutation: ViewMutationRecord) {
        if (!dom || !contentDOM) return true;
        // Selection changes are handled by ProseMirror itself.
        if (mutation.type === 'selection') return false;
        // Ignore framework-managed mutations outside the content DOM.
        return !contentDOM.contains(mutation.target);
      },

      update(nextNode: PMNode) {
        if (nextNode.type !== latestNode.type) return false;
        latestNode = nextNode;
        if (!nextNode.sameMarkup(nodeRef.value)) {
          nodeRef.value = nextNode;
        }
        return true;
      },
      selectNode() {
        selected.value = true;
      },
      deselectNode() {
        selected.value = false;
      },
      destroy() {
        render(null, host);
      },
    };
  };
}
