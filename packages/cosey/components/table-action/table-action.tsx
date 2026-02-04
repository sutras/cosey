import { defaultTableActionProps, tableActionProps } from './table-action.api';
import Item from './item';

import useStyle from './table-action.style';
import { useComponentConfig, useConfig } from '../config-provider';
import { computed, defineComponent, unref } from 'vue';
import { TableActionItemProps } from './item.api';
import { isObject } from '../../utils';
import { ElDivider } from 'element-plus';
import { defaults } from 'lodash-es';

export default defineComponent({
  name: 'CoTableAction',
  props: tableActionProps,
  setup(props) {
    const dyadicActions = computed(() => {
      const actions = props.actions.filter(Boolean);
      return (Array.isArray(actions[0]) ? actions : [actions]) as TableActionItemProps[][];
    });

    const { prefixCls } = useComponentConfig('table-action', props);

    const { hashId } = useStyle(prefixCls);

    const { tableAction: tableActionConfig } = useConfig();

    const mergeProps = computed(() => {
      return defaults({}, props, unref(tableActionConfig), defaultTableActionProps);
    });

    return () => {
      return (
        <div class={[hashId.value, prefixCls.value]}>
          {dyadicActions.value.map((actions, rowIndex) => {
            return (
              <div
                key={rowIndex}
                class={[`${prefixCls.value}-row`, { 'is-divider': mergeProps.value.divider }]}
              >
                {actions
                  .filter(
                    (item) => isObject(item) && (item.hidden ? false : (item.visible ?? true)),
                  )
                  .map((action, actionIndex, arr) => {
                    return (
                      <>
                        <Item key={actionIndex} props={action} />
                        {mergeProps.value.divider && actionIndex !== arr.length - 1 && (
                          <ElDivider direction="vertical" />
                        )}
                      </>
                    );
                  })}
              </div>
            );
          })}
        </div>
      );
    };
  },
});
