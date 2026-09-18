import { computed, defineComponent, ref } from 'vue';
import Picker from './picker';
import { colorNames, colorPalettes } from './color-picker.api';
import { Icon } from '../../icon';
import { ElInput } from 'element-plus';
import { TinyColor } from '@ctrl/tinycolor';
import { useHistoryColor } from '../hooks/useHistoryColor';
import { isBoolean, isString, createBem } from '../../../utils';
import { RtiColorPicker, RtiSlashForward } from 'richtext-icons';

export default defineComponent({
  name: 'CoEditorColorPicker',
  props: {
    visible: { type: Boolean },
  },
  emits: {
    'update:visible': (visible: boolean) => isBoolean(visible),
    select: (color: string) => isString(color),
    clear: () => true,
  },
  setup(props, { slots, emit }) {
    const bem = createBem('editor-color-picker');

    const innerVisible = computed({
      get() {
        return props.visible;
      },
      set(visible: boolean) {
        emit('update:visible', visible);
      },
    });

    const inputColor = ref('');

    const { historyColors, pushHistory } = useHistoryColor();

    const mapHistoryColors = computed(() => {
      return Array(colorNames.length)
        .fill(0)
        .map((_, i) => {
          return historyColors.value[i] || '';
        });
    });

    const normalInputColor = computed(() => new TinyColor(inputColor.value).toHexString());

    const isEyeDropperSupported = computed(() => typeof (window as any).EyeDropper === 'function');

    const select = (color: string) => {
      pushHistory(color);
      emit('select', color);
      emit('update:visible', false);
    };

    const onSelect = (color: string) => {
      if (color) {
        select(color);
      }
    };

    const onCustomSelect = () => {
      select(normalInputColor.value);
    };

    const onClear = () => {
      emit('clear');
      emit('update:visible', false);
    };

    const onAbsorb = () => {
      const eyeDropper = new (window as any).EyeDropper();
      eyeDropper.open().then((result: any) => {
        inputColor.value = result.sRGBHex;
      });
    };

    return () => {
      return (
        <Picker
          popperClass={bem.b()}
          v-model:visible={innerVisible.value}
          v-slots={{
            default: slots.default,
            content: () => (
              <>
                <div class={bem.e('title')}>预设</div>
                <div class={bem.e('preset')}>
                  {colorPalettes.map((row, i) => (
                    <div key={i} class={bem.e('row')}>
                      {row.map((color, j) => (
                        <div key={j} class={bem.e('item')}>
                          <button
                            type="button"
                            class={[bem.e('color'), bem.e('btn')]}
                            style={{ background: color }}
                            onClick={() => onSelect(color)}
                          ></button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div class={bem.e('title')}>最近使用</div>
                <div class={bem.e('row')}>
                  {mapHistoryColors.value.map((color, i) => (
                    <div key={i} class={bem.e('item')}>
                      <button
                        type="button"
                        class={[bem.e('color'), bem.e('btn'), bem.is('empty', !color)]}
                        style={{ background: color }}
                        onClick={() => onSelect(color)}
                      ></button>
                    </div>
                  ))}
                </div>

                <div class={bem.e('title')}>手动设置</div>
                <div class={bem.e('manual')}>
                  {isEyeDropperSupported.value && (
                    <button type="button" class={bem.e('btn')} onClick={onAbsorb}>
                      <Icon size="lg">
                        <RtiColorPicker />
                      </Icon>
                    </button>
                  )}
                  <ElInput
                    v-model={inputColor.value}
                    size="small"
                    placeholder="请输入"
                    class={bem.e('input')}
                  />
                  <button
                    type="button"
                    class={[bem.e('color'), bem.e('btn')]}
                    style={{ backgroundColor: normalInputColor.value }}
                    onClick={onCustomSelect}
                  ></button>
                  <button
                    type="button"
                    class={[bem.e('color'), bem.e('btn'), bem.e('clear')]}
                    onClick={onClear}
                  >
                    <Icon size="lg">
                      <RtiSlashForward />
                    </Icon>
                  </button>
                </div>
              </>
            ),
          }}
        ></Picker>
      );
    };
  },
});
