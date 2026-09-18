import { defineComponent, onMounted, reactive, ref, shallowRef, useTemplateRef } from 'vue';
import Picker from './picker';
import Button from '../button';
import { Icon } from '../../icon';
import { createBem } from '../../../utils';
import { useEditor } from '../pm/context';
import { RtiTable } from 'richtext-icons';

export default defineComponent({
  name: 'CoEditorFormatTable',
  setup() {
    const bem = createBem('editor-format-table');

    const editor = useEditor();

    const count = 10;

    const visible = ref(false);

    const buttonRef = useTemplateRef<{
      el: HTMLButtonElement;
    }>('button');

    const triggerTarget = shallowRef<HTMLElement | null>();

    const grid = reactive({
      row: 0,
      col: 0,
    });

    onMounted(() => {
      triggerTarget.value = buttonRef.value?.el;
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
      visible.value = false;
    };

    return () => {
      return (
        <Picker
          popperClass={bem.b()}
          v-model:visible={visible.value}
          trigger-target={triggerTarget.value}
          nopadding
          v-slots={{
            default: () => (
              <Button ref="button" onClick={onBtnClick}>
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
