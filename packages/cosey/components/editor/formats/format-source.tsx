import { defineComponent, ref } from 'vue';
import { ElButton, ElDialog, ElInput } from 'element-plus';
import { Icon } from '../../icon';
import Button from '../button';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';
import { RtiSourceCode } from 'richtext-icons';

export default defineComponent({
  name: 'CoEditorFormatSource',
  setup() {
    const { t } = useLocale();

    const editor = useEditor();

    const visible = ref(false);

    const value = ref('');

    const onClick = () => {
      value.value = editor.serialize();
      visible.value = true;
    };

    const onCancel = () => {
      visible.value = false;
    };

    const onConfirm = () => {
      editor.setContent(value.value);

      visible.value = false;
    };

    return () => {
      return (
        <>
          <Button title={t('co.editor.sourceCode')} onClick={onClick}>
            <Icon>
              <RtiSourceCode />
            </Icon>
          </Button>
          <ElDialog
            title={t('co.editor.sourceCode')}
            v-model={visible.value}
            width="992px"
            style="max-width: calc(100vw - 32px)"
            v-slots={{
              default: () => <ElInput v-model={value.value} type="textarea" rows={26} />,
              footer: () => (
                <>
                  <ElButton onClick={onCancel}>{t('co.common.cancel')}</ElButton>
                  <ElButton type="primary" onClick={onConfirm}>
                    {t('co.common.confirm')}
                  </ElButton>
                </>
              ),
            }}
          ></ElDialog>
        </>
      );
    };
  },
});
