import { computed, defineComponent, ref, unref } from 'vue';
import { omit } from 'lodash-es';
import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu, ElPopconfirm } from 'element-plus';
import {
  type TableActionItemProps,
  defaultTableActionItemProps,
  tableActionItemProps,
} from './item.api';
import Icon from '../icon/icon';
import { useToken } from '../theme';
import { useLocale } from '../../hooks';
import { useConfig } from '../config-provider';

export default defineComponent({
  name: 'CoTableActionItem',
  inheritAttrs: false,
  props: tableActionItemProps,
  setup(props) {
    const { t } = useLocale();

    const { token } = useToken();

    const { tableAction: tableActionConfig } = useConfig();

    const mergedProps = computed<TableActionItemProps>(() => {
      return {
        ...defaultTableActionItemProps,
        ...unref(tableActionConfig)?.itemProps,
        ...props.props,
      };
    });

    const buttonProps = computed(() => {
      return omit(unref(mergedProps), [
        'icon',
        'appendIcon',
        'visible',
        'hidden',
        'popconfirm',
        'label',
        'dropdown',
      ]);
    });

    const loading = ref(false);

    const onConfirm = async (e: MouseEvent, confirm: (e: MouseEvent) => void) => {
      loading.value = true;
      try {
        await unref(mergedProps).popconfirm?.confirm?.(e);
        confirm(e);
      } catch {
        void 0;
      } finally {
        loading.value = false;
      }
    };

    const onCancel = (e: MouseEvent, cancel: (e: MouseEvent) => void) => {
      cancel(e);
    };

    const renderButton = () => {
      return (
        <ElButton {...buttonProps.value} style="margin: 0">
          {unref(mergedProps).icon && (
            <Icon
              name={unref(mergedProps).icon}
              style={{ marginInlineEnd: token.value.marginXXS + 'px' }}
            />
          )}
          {unref(mergedProps).label}
          {unref(mergedProps).appendIcon && (
            <Icon
              name={unref(mergedProps).appendIcon}
              style={{ marginInlineStart: token.value.marginXXS + 'px' }}
            />
          )}
        </ElButton>
      );
    };

    return () => {
      if (unref(mergedProps).popconfirm) {
        return (
          <ElPopconfirm {...unref(mergedProps).popconfirm}>
            {{
              reference: () => renderButton(),
              actions: ({ confirm, cancel }: any) => {
                return (
                  <>
                    <ElButton size="small" onClick={(event) => onCancel(event, cancel)}>
                      {t('co.common.no')}
                    </ElButton>
                    <ElButton
                      type="danger"
                      size="small"
                      loading={loading.value}
                      onClick={(event) => onConfirm(event, confirm)}
                    >
                      {t('co.common.yes')}
                    </ElButton>
                  </>
                );
              },
            }}
          </ElPopconfirm>
        );
      }

      if (unref(mergedProps).dropdown && unref(mergedProps).dropdown!.length > 0) {
        return (
          <ElDropdown trigger="click">
            {{
              default: () => renderButton(),
              dropdown: () => (
                <ElDropdownMenu>
                  {unref(mergedProps)
                    .dropdown?.filter((item) => item.visible ?? true)
                    .map(({ label, icon, appendIcon, onClick, ...rest }) => {
                      return (
                        <ElDropdownItem {...omit(rest, ['visible', 'onClick'])} onClick={onClick}>
                          {icon && (
                            <Icon
                              name={icon}
                              style={{ marginInlineEnd: token.value.marginXXS + 'px' }}
                            />
                          )}
                          {label}
                          {appendIcon && (
                            <Icon
                              name={appendIcon}
                              style={{ marginInlineStart: token.value.marginXXS + 'px' }}
                            />
                          )}
                        </ElDropdownItem>
                      );
                    })}
                </ElDropdownMenu>
              ),
            }}
          </ElDropdown>
        );
      }

      return renderButton();
    };
  },
});
