import { defineComponent, ref, useTemplateRef, watch } from 'vue';
import { useZIndex } from 'element-plus';
import { createBem, isNumber } from '../../../utils';

export type ResizePosition = 'nw' | 'ne' | 'sw' | 'se';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const onDrag = (
  downRect: Rect,
  currRect: Rect,
  options: {
    position: ResizePosition;
    x: number;
    y: number;
    min: number;
    max: number;
    cb: (rect: Rect) => void;
  },
) => {
  const { x, y } = currRect;
  const aspectScale = downRect.width / downRect.height;
  let width = 0;

  switch (options.position) {
    case 'nw':
    case 'sw':
      width = downRect.x + downRect.width - options.x;
      break;
    case 'ne':
    case 'se':
      width = options.x - downRect.x;
      break;
  }

  if (width < options.min) {
    width = options.min;
  } else if (width > options.max) {
    width = options.max;
  }

  const height = width / aspectScale;

  options.cb({
    x,
    y,
    width,
    height,
  });
};

const corners: ResizePosition[] = ['nw', 'ne', 'sw', 'se'];

export default defineComponent({
  name: 'CoEditorResize',
  props: {
    visible: {
      type: Boolean,
    },
  },
  emits: {
    resize: (event: { width: number; height: number }) =>
      isNumber(event.width) && isNumber(event.height),
    resizeEnd: (event: { width: number; height: number }) =>
      isNumber(event.width) && isNumber(event.height),
  },
  setup(props, { emit }) {
    const bem = createBem('editor-resize');

    const downs: { [K in ResizePosition]?: boolean } = {};

    const elRef = useTemplateRef<HTMLElement>('el');

    let downRect: DOMRect | null = null;

    const onPointerDown = (corner: ResizePosition, event: PointerEvent) => {
      const el = elRef.value;
      if (!el) return;

      event.preventDefault();
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);

      downs[corner] = true;
      downRect = el.getBoundingClientRect();
    };

    const width = ref(0);
    const height = ref(0);

    const onPointerMove = (corner: ResizePosition, event: MouseEvent) => {
      event.preventDefault();

      if (downs[corner] && downRect) {
        sizeVisible.value = true;
        sizeX.value = event.clientX;
        sizeY.value = event.clientY;
        onDrag(downRect, downRect, {
          position: corner,
          x: event.clientX,
          y: event.clientY,
          min: 16,
          max: Infinity,
          cb: (rect) => {
            emit('resize', {
              width: (width.value = ~~rect.width),
              height: (height.value = ~~rect.height),
            });
          },
        });
      }
    };

    const onPointerUp = (corner: ResizePosition) => {
      const resized = sizeVisible.value;
      if (resized) {
        emit('resizeEnd', { width: width.value, height: height.value });
      }

      sizeVisible.value = false;
      downRect = null;
      downs[corner] = false;
    };

    // size
    const sizeVisible = ref(false);
    const sizeX = ref(0);
    const sizeY = ref(0);

    const { currentZIndex, nextZIndex } = useZIndex();

    watch(
      sizeVisible,
      () => {
        if (sizeVisible.value) {
          nextZIndex();
        }
      },
      {
        immediate: true,
      },
    );

    return () => {
      return (
        <div
          ref="el"
          class={[bem.b(), bem.is('show', props.visible)]}
          onMousemove={(event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
          }}
        >
          {corners.map((corner) => {
            return (
              <div
                key={corner}
                class={[bem.e('corner'), bem.em('corner', corner)]}
                onPointerdown={(event) => {
                  onPointerDown(corner, event);
                }}
                onPointermove={(event) => onPointerMove(corner, event)}
                onPointerup={() => onPointerUp(corner)}
                onPointercancel={() => onPointerUp(corner)}
              ></div>
            );
          })}
          <div
            v-show={sizeVisible.value}
            class={bem.e('size')}
            style={{
              transform: `translate(${sizeX.value}px, ${sizeY.value}px)`,
              zIndex: currentZIndex.value,
            }}
          >{`${width.value} x ${height.value}`}</div>
        </div>
      );
    };
  },
});
