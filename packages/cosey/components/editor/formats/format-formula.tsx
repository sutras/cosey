import {
  ref,
  useTemplateRef,
  watch,
  reactive,
  defineComponent,
  computed,
  type PropType,
} from 'vue';
import { ElButton, ElInput, ElSpace } from 'element-plus';
import katex from 'katex';
import Button from '../button';
import { ContextMenuContent } from '../../context-menu';
import { Panel } from '../../panel';
import { FormDialog } from '../../form-dialog';
import { Form } from '../../form';
import Row from '../../row';
import Col from '../../col';
import Icon from '../../icon';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';
import { formulas } from './formula-presets';
import { RtiFormula } from 'richtext-icons';

export default defineComponent({
  name: 'CoEditorFormatFormula',
  props: {
    label: { type: String },
    /** 作为上下文菜单项内嵌展示（菜单项样式而非按钮），仅渲染触发器外观差异，弹窗逻辑不变 */
    embedded: { type: Boolean },
    /** 点击触发器后的回调。上下文菜单场景用于在弹出 FormDialog 前先关闭菜单 */
    onTrigger: { type: Function as PropType<() => void | undefined> },
  },
  setup(props) {
    const editor = useEditor();
    const { t } = useLocale();

    const isActive = computed(() => {
      void editor.version.value;
      return editor.isFormulaActive();
    });

    const visible = ref(false);

    const formModel = reactive({
      formula: '',
    });

    const onSubmit = () => {
      if (formModel.formula) {
        editor.insertFormula(formModel.formula);
      }
    };

    const onClick = () => {
      const attrs = editor.getFormulaAttrs();

      // 弹出弹窗前先通知外层（上下文菜单）关闭菜单
      props.onTrigger?.();

      formModel.formula = attrs?.formula || '';
      visible.value = true;
    };

    const previewEl = useTemplateRef<HTMLElement>('preview');

    watch([previewEl, () => formModel.formula], ([el, formula]) => {
      if (el) {
        katex.render(formula, el, {
          throwOnError: false,
          errorColor: '#f00',
          output: 'mathml',
        });
      }
    });

    return () => {
      const label = props.label ?? t('co.editor.formula');

      return (
        <>
          {props.embedded ? (
            <ContextMenuContent
              title={label}
              active={isActive.value}
              onClick={onClick}
              v-slots={{ icon: () => <RtiFormula /> }}
            />
          ) : (
            <Button active={isActive.value} label={props.label} title={label} onClick={onClick}>
              <Icon>
                <RtiFormula />
              </Icon>
            </Button>
          )}

          <FormDialog v-model={visible.value} title="LaTeX 公式" width="760px">
            <Row gutter={8} style="row-gap: 8px">
              <Col sm={8}>
                <Panel header="数学公式" maxHeight="300px">
                  <ElSpace fill>
                    {formulas.map((item) => (
                      <ElButton
                        key={item.formula}
                        onClick={() => (formModel.formula = item.formula)}
                      >
                        {item.name}
                      </ElButton>
                    ))}
                  </ElSpace>
                </Panel>
              </Col>
              <Col sm={16}>
                <ElSpace fill style="display: flex">
                  <Panel header="编辑公式">
                    <Form model={formModel} submit={onSubmit}>
                      <ElInput
                        v-model={formModel.formula}
                        type="textarea"
                        placeholder="请输入公式"
                        resize="none"
                        rows={6}
                      />
                    </Form>
                  </Panel>
                  <Panel header="预览">
                    <div ref="preview" style="height: 80px"></div>
                  </Panel>
                </ElSpace>
              </Col>
            </Row>
          </FormDialog>
        </>
      );
    };
  },
});
