import { inputNumberRangeProps, inputNumberRangeEmits } from './input-number-range.api';
import { CHANGE_EVENT, ElInputNumber, useFormItem } from 'element-plus';
import { defineComponent, nextTick, ref, watch } from 'vue';
import { debugWarn, isNullish, createBem } from '../../utils';

export default defineComponent({
  name: 'CoInputNumberRange',
  props: inputNumberRangeProps,
  emits: inputNumberRangeEmits,
  setup(props, { emit }) {
    const bem = createBem('input-number-range');

    const { formItem } = useFormItem();

    const start = ref<number | null>(null);
    const end = ref<number | null>(null);

    const innerValue = ref<number[] | undefined>(props.modelValue);

    const isFocused = ref(false);

    /** 两端都填了但开始 > 结束 */
    const isInverted = (startValue: number | null, endValue: number | null) =>
      !isNullish(startValue) && !isNullish(endValue) && startValue > endValue;

    const commit = (value: number[] | undefined) => {
      const prev = innerValue.value;

      if (prev === value || (prev && value && prev[0] === value[0] && prev[1] === value[1])) {
        return;
      }

      innerValue.value = value;
      emit('update:modelValue', value);
      emit('change', value);
    };

    /** 填反了就交换回来，返回是否换过 */
    const normalizeOrder = () => {
      const [startValue, endValue] = [start.value, end.value];

      if (!isInverted(startValue, endValue)) {
        return false;
      }

      start.value = endValue;
      end.value = startValue;

      return true;
    };

    // 初值先回填（immediate），再注册下面那个「变化就提交」的监听：
    // 既能把传入的值显示出来，也不会在挂载时白抛一次 change
    let initialized = false;

    watch(
      () => props.modelValue,
      (newValue) => {
        // 自己 emit 出去的值得回流时不要重置输入框，否则清空一端会把另一端也清掉
        if (initialized && newValue === innerValue.value) {
          return;
        }

        initialized = true;
        innerValue.value = newValue;

        if (!newValue) {
          start.value = null;
          end.value = null;

          return;
        }

        const [startValue, endValue] = newValue.map((item) => {
          const value = +item;

          return Number.isNaN(value) ? null : value;
        });

        const inverted = isInverted(startValue, endValue);

        start.value = inverted ? endValue : startValue;
        end.value = inverted ? startValue : endValue;

        // 传进来的就是倒挂的：显示归显示，模型也得跟着改成交换后的值，
        // 否则界面上是 [5, 100]、提交出去还是 [100, 5]
        if (inverted) {
          innerValue.value = [endValue!, startValue!];
          emit('update:modelValue', innerValue.value);
        }
      },
      { immediate: true },
    );

    watch([start, end], () => {
      // 只填好一端等同于没填：范围还没形成，模型就是 undefined
      if (isNullish(start.value) || isNullish(end.value)) {
        commit(undefined);
        return;
      }

      // 倒挂：输入过程中不打扰（边打字边交换会让数字乱跳），失焦后再纠正。
      // 值被外部改回倒挂时组件已失焦，这里顺手纠一下。
      if (isInverted(start.value, end.value)) {
        if (!isFocused.value) {
          normalizeOrder();
        }

        return;
      }

      commit([start.value!, end.value!]);
    });

    watch(
      () => props.modelValue,
      () => {
        if (props.validateEvent) {
          formItem?.validate?.(CHANGE_EVENT).catch(debugWarn);
        }
      },
    );

    const onFocusIn = () => {
      isFocused.value = true;
    };

    const onFocusOut = (event: FocusEvent) => {
      const wrapper = event.currentTarget as HTMLElement;
      const next = event.relatedTarget as Node | null;

      isFocused.value = false;

      // 焦点只是从开始框挪到结束框，还没离开组件
      if (next && wrapper.contains(next)) {
        return;
      }

      // ElInputNumber 把输入提交到 v-model 可能晚于 focusout，等一个 tick 再判断
      nextTick(normalizeOrder);
    };

    return () => {
      return (
        <div
          class={[
            bem.b(),
            bem.is('focus', isFocused.value),
            bem.is('disabled', props.disabled),
            'el-input__wrapper',
          ]}
          onFocusin={onFocusIn}
          onFocusout={onFocusOut}
        >
          <div class={bem.e('start')}>
            <ElInputNumber
              v-model={start.value}
              min={props.min}
              max={props.max}
              step={props.step}
              stepStrictly={props.stepStrictly}
              precision={props.precision}
              controls={false}
              readonly={props.readonly}
              disabled={props.disabled}
              placeholder={props.startPlaceholder}
            />
          </div>
          <div class={bem.e('separator')}>-</div>
          <div class={bem.e('end')}>
            <ElInputNumber
              v-model={end.value}
              min={props.min}
              max={props.max}
              step={props.step}
              stepStrictly={props.stepStrictly}
              precision={props.precision}
              controls={false}
              readonly={props.readonly}
              disabled={props.disabled}
              placeholder={props.endPlaceholder}
            />
          </div>
        </div>
      );
    };
  },
});
