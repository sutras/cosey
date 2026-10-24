import { computed, defineComponent, h, nextTick, onMounted, ref, watch } from 'vue';
import {
  typographyEmits,
  typographyParagraphProps,
  typographyProps,
  typographySlots,
  typographyTitleProps,
  type TypographyEllipsisConfig,
} from './typography.api';
import { createBem, getVNodeText } from '../../utils';
import { useLocale, useResizeObserver } from '../../hooks';
import Copy from '../copy';

const ELLIPSIS = '…';

/** 'normal' 之类拿不到数值时按 1.5 倍字号兜底 */
const resolveLineHeight = (el: HTMLElement) => {
  const { lineHeight, fontSize } = getComputedStyle(el);
  const value = parseFloat(lineHeight);

  return Number.isFinite(value) ? value : parseFloat(fontSize) * 1.5;
};

interface TypographyOptions {
  name: string;
  tag: string | ((props: any) => string);
  props?: Record<string, any>;
}

const createTypography = ({ name, tag, props: extraProps = {} }: TypographyOptions) =>
  defineComponent({
    name,
    props: { ...typographyProps, ...extraProps },
    slots: typographySlots,
    emits: typographyEmits,
    setup(props, { slots, emit }) {
      const bem = createBem('typography');

      const { t } = useLocale();

      const rootRef = ref<HTMLElement>();

      const contentRef = ref<HTMLElement>();

      /** 离屏测量节点：只用来量「文本 + 省略号 + 文案」占几行 */
      const measureRef = ref<HTMLElement>();

      const text = computed(() => props.text ?? '');

      const displayText = ref('');
      const measured = ref(false);
      const truncated = ref(false);
      const expanded = ref(false);

      const config = computed<TypographyEllipsisConfig>(() => {
        const value = props.ellipsis;

        if (value === true) {
          return { rows: 1 };
        }

        return value && typeof value === 'object' ? (value as TypographyEllipsisConfig) : {};
      });

      const ellipsisEnabled = computed(() => !!props.ellipsis);

      const rows = computed(() => {
        const value = Math.floor(Number(config.value.rows));

        return Number.isFinite(value) && value > 0 ? value : 3;
      });

      const symbol = computed(() => config.value.symbol ?? ELLIPSIS);

      const expandable = computed(() => !!config.value.expandable);

      const symbolPosition = computed(() => config.value.symbolPosition ?? 'tail');

      /** 按「保留多少个字」拼出可见文本：省略号放头 / 中 / 尾 */
      const compose = (keep: number) => {
        const value = text.value;

        if (symbolPosition.value === 'head') {
          return symbol.value + value.slice(value.length - keep);
        }

        if (symbolPosition.value === 'middle') {
          const head = Math.ceil(keep / 2);
          const tail = keep - head;

          return (
            value.slice(0, head) + symbol.value + (tail ? value.slice(value.length - tail) : '')
          );
        }

        return value.slice(0, keep) + symbol.value;
      };

      /** 复制用文本：没有 `text` 时从默认插槽里取纯文本 */
      const copyText = computed(() => {
        if (!props.copyable) {
          return '';
        }

        return text.value || getVNodeText(slots.default?.({}) ?? '');
      });

      const showCopy = computed(() => props.copyable && !!copyText.value);

      const expandText = computed(() => config.value.expandText || t('co.toggle.unfold'));

      const toggleText = computed(() =>
        expanded.value ? config.value.collapseText || t('co.toggle.fold') : expandText.value,
      );

      /**
       * 按行数算出能放下多少字：二分找「文本 + 省略号 + 展开文案」正好塞进 rows 行的最大长度，
       * 这样按钮能直接跟在省略号后面，既不额外占行，也不用背景色盖住正文。
       */
      const measure = () => {
        const el = contentRef.value;

        if (!el || !ellipsisEnabled.value || expanded.value) {
          return;
        }

        // 插槽内容没法按字符切，交给 CSS clamp
        if (!text.value) {
          truncated.value = el.scrollHeight - el.clientHeight > 1;
          measured.value = true;
          return;
        }

        const measurer = measureRef.value;

        if (!measurer) {
          displayText.value = text.value;
          truncated.value = false;
          measured.value = true;
          return;
        }

        const maxHeight = resolveLineHeight(el) * rows.value;

        // 宽度按根元素实际宽度给（行内元素上 `width: 100%` 不可靠）
        const width = rootRef.value?.getBoundingClientRect().width ?? 0;

        if (width) {
          measurer.style.width = `${width}px`;
        }

        fillMeasurer(text.value);

        if (measurer.scrollHeight <= maxHeight + 1) {
          displayText.value = text.value;
          truncated.value = false;
          measured.value = true;
          measurer.textContent = '';
          return;
        }

        const toggleSuffix = expandable.value ? expandText.value : '';
        let low = 0;
        let high = text.value.length;
        let best = 0;

        while (low <= high) {
          const middle = Math.floor((low + high) / 2);

          // 展开按钮 / 复制按钮都跟在文本后面，占位要一起算进去
          fillMeasurer(compose(middle) + toggleSuffix);

          if (measurer.scrollHeight <= maxHeight + 1) {
            best = middle;
            low = middle + 1;
          } else {
            high = middle - 1;
          }
        }

        displayText.value = compose(best);
        truncated.value = true;
        measured.value = true;
        measurer.textContent = '';
      };

      const remeasure = async () => {
        await nextTick();
        measure();
      };

      const toggle = () => {
        if (!truncated.value) {
          return;
        }

        expanded.value = !expanded.value;
        emit('expand-change', expanded.value);

        if (!expanded.value) {
          remeasure();
        }
      };

      watch(() => [props.text, props.ellipsis], remeasure);

      watch(truncated, (value) => emit('truncate-change', value));

      // 容器宽度变化（侧栏折叠、窗口缩放）后重新裁剪
      useResizeObserver(contentRef, measure);

      onMounted(remeasure);

      const showToggle = computed(
        () => ellipsisEnabled.value && expandable.value && truncated.value,
      );

      const contentStyle = computed(() => {
        if (!ellipsisEnabled.value || expanded.value) {
          return undefined;
        }

        // 已按字符裁好就撤掉 clamp：clamp 的 -webkit-box 会把行内按钮变成独立盒
        if (text.value && measured.value) {
          return undefined;
        }

        return { '-webkit-line-clamp': String(rows.value) };
      });

      /** 测量用的占位节点：复制按钮的宽度、以及各按钮的左边距 */
      let copyReserve: HTMLElement | null = null;
      let gapReserve: HTMLElement | null = null;

      const copyReserveEl = () => {
        if (!copyReserve) {
          copyReserve = document.createElement('span');

          copyReserve.className = bem.e('reserve');
        }

        return copyReserve;
      };

      const gapReserveEl = () => {
        if (!gapReserve) {
          gapReserve = document.createElement('span');

          gapReserve.className = bem.e('gap');
        }

        return gapReserve;
      };

      /** 把文本后面要占位的节点塞给测量节点 */
      const fillMeasurer = (value: string) => {
        const measurer = measureRef.value!;

        measurer.textContent = value;

        if (expandable.value) {
          measurer.append(gapReserveEl());
        }

        if (showCopy.value) {
          measurer.append(copyReserveEl());
        }
      };

      const renderText = () => props.text || slots.default?.({});

      const renderCopy = () => <Copy text={copyText.value} class={bem.e('copy')} />;

      const renderToggle = () =>
        showToggle.value ? (
          <button type="button" class={bem.e('toggle')} onClick={toggle}>
            {toggleText.value}
          </button>
        ) : null;

      const renderContent = () => {
        if (!ellipsisEnabled.value) {
          return [renderText(), showCopy.value ? renderCopy() : null];
        }

        if (expanded.value) {
          return [text.value || renderText(), renderToggle(), showCopy.value ? renderCopy() : null];
        }

        if (!truncated.value) {
          return [displayText.value || renderText(), showCopy.value ? renderCopy() : null];
        }

        return [displayText.value, renderToggle(), showCopy.value ? renderCopy() : null];
      };

      return () => {
        const tagName = typeof tag === 'function' ? tag(props) : tag;

        const level = Number((props as any).level);

        const body = h(
          tagName,
          {
            ref: rootRef,
            class: [
              bem.b(),
              bem.m(props.type, !!props.type),
              bem.m(`h${level}`, Number.isFinite(level) && level > 0),
              bem.is('disabled', props.disabled),
              bem.is('mark', props.mark),
              bem.is('code', props.code),
              bem.is('underline', props.underline),
              bem.is('delete', props.delete),
              bem.is('strong', props.strong),
              bem.is('italic', props.italic),
              bem.is('ellipsis', ellipsisEnabled.value),
              bem.is('truncated', truncated.value),
              bem.is('expanded', expanded.value),
              bem.is('trimmed', ellipsisEnabled.value && !!text.value && measured.value),
            ],
          },
          [
            <div ref={contentRef} class={bem.e('content')} style={contentStyle.value}>
              {renderContent()}
            </div>,
            ellipsisEnabled.value && text.value ? (
              <div ref={measureRef} class={bem.e('measure')} aria-hidden="true" />
            ) : null,
          ],
        );

        return body;
      };
    },
  });

export const Typography = createTypography({ name: 'CoTypography', tag: 'article' });

export const TypographyText = createTypography({ name: 'CoTypographyText', tag: 'span' });

export const TypographyTitle = createTypography({
  name: 'CoTypographyTitle',
  tag: (props) => `h${Math.min(Math.max(Number(props.level) || 1, 1), 5)}`,
  props: typographyTitleProps,
});

export const TypographyParagraph = createTypography({
  name: 'CoTypographyParagraph',
  tag: (props) => props.tag || 'div',
  props: typographyParagraphProps,
});
