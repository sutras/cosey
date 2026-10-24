import { computed, defineComponent } from 'vue';
import { TypographyParagraph } from './typography';
import {
  longTextProps,
  typographyEmits,
  typographySlots,
  type TypographyEllipsisConfig,
} from './typography.api';

/**
 * 旧的长文本组件，现在只是 `co-typography-paragraph` 的一层参数映射。
 * @deprecated 用 `TypographyParagraph` + `ellipsis`
 */
export default defineComponent({
  name: 'CoLongText',
  props: longTextProps,
  slots: typographySlots,
  emits: typographyEmits,
  setup(props, { slots, emit }) {
    const ellipsis = computed<TypographyEllipsisConfig>(() => ({
      rows: Number(props.rows) || 3,
      expandable: props.expandable,
      expandText: props.expandText,
      collapseText: props.collapseText,
    }));

    // 工厂生成的组件在 JSX 里推不出完整 props，这里放开类型
    const Paragraph = TypographyParagraph as any;

    return () => (
      <Paragraph
        text={props.text}
        type={props.type}
        disabled={props.disabled}
        mark={props.mark}
        code={props.code}
        underline={props.underline}
        delete={props.delete}
        strong={props.strong}
        italic={props.italic}
        copyable={props.copyable}
        tag={props.tag}
        ellipsis={ellipsis.value}
        onTruncateChange={(value: boolean) => emit('truncate-change', value)}
        onExpandChange={(value: boolean) => emit('expand-change', value)}
        v-slots={{ default: slots.default }}
      />
    );
  },
});
