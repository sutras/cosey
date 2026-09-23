import {
  defineComponent,
  onMounted,
  reactive,
  ref,
  shallowRef,
  useTemplateRef,
  type PropType,
} from 'vue';
import Picker from '../ui/picker';
import Button from '../ui/button';
import { Icon } from '../../icon';
import { ContextMenuContent } from '../../context-menu';
import { createBem } from '../../../utils';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';
import { RtiTable } from 'richtext-icons';

export default defineComponent({
  name: 'CoEditorFormatTable',
  props: {
    label: { type: String },
    /** 作为上下文菜单项内嵌展示（菜单项样式而非按钮），仅渲染触发器外观差异，弹窗逻辑不变 */
    embedded: { type: Boolean },
    /**
     * 插入完成后的回调。上下文菜单场景用于在选定格子、真正插入表格后关闭菜单——
     * 网格选择器锚定菜单项，选择期间菜单保持打开才能正确定位。
     */
    onTrigger: { type: Function as PropType<() => void | undefined> },
  },
  setup(props) {
    const bem = createBem('editor-format-table');
    const { t } = useLocale();

    const editor = useEditor();

    const count = 10;

    const visible = ref(false);

    const buttonRef = useTemplateRef<{
      el: HTMLButtonElement;
    }>('button');

    // embedded 模式下用菜单项（ContextMenuContent）作为网格选择器的定位锚点
    const contentRef = useTemplateRef<{
      el: HTMLElement;
    }>('content');

    const pickerRef = useTemplateRef<{
      hide: () => void;
    }>('picker');

    const triggerTarget = shallowRef<HTMLElement | null>();

    const grid = reactive({
      row: 0,
      col: 0,
    });

    onMounted(() => {
      triggerTarget.value = props.embedded ? contentRef.value?.el : buttonRef.value?.el;
    });

    const onBtnClick = () => {
      if (!visible.value) {
        grid.row = 0;
        grid.col = 0;
      }
      visible.value = !visible.value;
    };

    const onCellPointerOver = (row: number, col: number) => {
      grid.row = row;
      grid.col = col;
    };

    const onCellClick = (rowCount: number, columnCount: number) => {
      editor.insertTable(rowCount, columnCount);
      // 先同步隐藏网格弹窗（不等 Vue 渲染），再关菜单：
      // 菜单关闭会让锚点菜单项 display:none，popper 检测到 reference 丢失会把
      // 还没隐藏完的弹窗重新定位到屏幕左上角，形成闪动。hide() 抢在这个前面。
      pickerRef.value?.hide();
      visible.value = false;
      // 插入完成后通知外层（上下文菜单）关闭菜单
      props.onTrigger?.();
    };

    return () => {
      const label = props.label ?? t('co.editor.table');

      return (
        <Picker
          ref="picker"
          popperClass={bem.b()}
          v-model:visible={visible.value}
          trigger-target={triggerTarget.value}
          nopadding
          noTransition
          v-slots={{
            default: () =>
              props.embedded ? (
                <ContextMenuContent
                  ref="content"
                  title={label}
                  onClick={onBtnClick}
                  v-slots={{ icon: () => <RtiTable /> }}
                />
              ) : (
                <Button ref="button" label={props.label} title={label} onClick={onBtnClick}>
                  <Icon>
                    <RtiTable />
                  </Icon>
                </Button>
              ),
            content: () => (
              <>
                <div class={bem.e('grid')}>
                  {Array(count)
                    .fill(0)
                    .map((_, row) => {
                      return (
                        <div key={row} class={bem.e('row')}>
                          {Array(count)
                            .fill(0)
                            .map((_, col) => {
                              return (
                                <div
                                  key={col}
                                  class={[
                                    bem.e('cell'),
                                    bem.is('selected', col <= grid.col && row <= grid.row),
                                  ]}
                                  onPointerover={() => onCellPointerOver(row, col)}
                                  onClick={() => onCellClick(row + 1, col + 1)}
                                ></div>
                              );
                            })}
                        </div>
                      );
                    })}
                </div>
                <div class={bem.e('count')}>{`${grid.col}x${grid.row}`}</div>
              </>
            ),
          }}
        ></Picker>
      );
    };
  },
});
