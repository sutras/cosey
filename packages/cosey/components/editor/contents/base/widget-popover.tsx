import { defineComponent, inject } from 'vue';
import { ElPopover, popoverProps } from 'element-plus';
import { createBem } from '../../../../utils';
import { popoverContainerContextKey } from '../../hooks/usePopoverContainer';

export default defineComponent({
  name: 'CoEditorWidgetPopover',
  props: popoverProps,
  setup(props, { slots }) {
    const bem = createBem('editor-widget-popover');

    const { popoverWrapper } = inject(popoverContainerContextKey)!;

    return () => {
      return (
        <ElPopover
          {...props}
          placement="bottom"
          trigger="click"
          popperClass={bem.e('popper')}
          appendTo={popoverWrapper}
          v-slots={{
            reference: () => slots.reference?.(),
            default: () => slots.default?.(),
          }}
        />
      );
    };
  },
});
