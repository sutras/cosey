import { ref, useTemplateRef, watch, reactive, defineComponent, computed } from 'vue';
import { ElButton, ElInput, ElSpace } from 'element-plus';
import katex from 'katex';
import Button from '../button';
import { Panel } from '../../panel';
import { FormDialog } from '../../form-dialog';
import { Form } from '../../form';
import Row from '../../row';
import Col from '../../col';
import Icon from '../../icon';
import { useEditor } from '../pm/context';
import { formulas } from './formula-presets';
import { RtiFormula } from 'richtext-icons';

export default defineComponent({
  name: 'CoEditorFormatFormula',
  setup() {
    const editor = useEditor();

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
      return (
        <>
          <Button active={isActive.value} onClick={onClick}>
            <Icon>
              <RtiFormula />
            </Icon>
          </Button>

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
