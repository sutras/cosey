import { computed, defineComponent, reactive, ref } from 'vue';
import { ElButton } from 'element-plus';
import { Icon } from '../../icon';
import Button from '../button';
import { FormDialog } from '../../form-dialog';
import { Form, FormItem } from '../../form';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';

export default defineComponent({
  name: 'CoEditorFormatLink',
  setup() {
    const { t } = useLocale();

    const editor = useEditor();

    const visible = ref(false);

    // Snapshot whether the dialog was opened on an existing link, so the form keeps its meaning
    // while it is open.
    const editing = ref(false);

    const formModel = reactive({
      url: '',
      text: '',
      target: '',
    });

    const isActive = computed(() => {
      void editor.version.value;
      return editor.isLinkActive();
    });

    const onClick = () => {
      const attrs = editor.getLinkAttrs();
      editing.value = !!attrs;

      if (attrs) {
        Object.assign(formModel, {
          url: attrs.url,
          target: attrs.target,
          text: attrs.text,
        });
      } else {
        const { from, to } = editor.state.selection;
        Object.assign(formModel, {
          url: '',
          target: '_blank',
          text: editor.state.doc.textBetween(from, to, ' '),
        });
      }

      visible.value = true;
    };

    const targetOptions = [
      { label: t('co.editor.currentWindow'), value: '_self' },
      { label: t('co.editor.newWindow'), value: '_blank' },
    ];

    const onSubmit = () => {
      if (!formModel.url.trim()) {
        return;
      }

      // A link always needs text: either typed by the user for a new link, or the display text of
      // the existing one.
      if (!editing.value && !formModel.text.trim()) {
        return;
      }

      editor.formatLink(formModel.url, formModel.target, formModel.text);
    };

    const onRemove = () => {
      editor.unwrapLink();
      visible.value = false;
    };

    return () => {
      return (
        <>
          <Button active={isActive.value} onClick={onClick}>
            <Icon name="co:link" />
          </Button>

          <FormDialog v-model={visible.value} title={t('co.editor.insertLink')} width="sm">
            <Form model={formModel} label-width="auto" submit={onSubmit}>
              <FormItem v-model={formModel.url} prop="url" label="URL" fieldType="input" required />
              <FormItem
                v-model={formModel.text}
                prop="text"
                label={t('co.editor.displayedText')}
                fieldType="input"
                required={!editing.value}
              />
              <FormItem
                v-model={formModel.target}
                prop="target"
                label={t('co.editor.openLinkAt')}
                fieldType="select"
                fieldProps={{
                  options: targetOptions,
                }}
              />
            </Form>
            {editing.value && (
              <div style="text-align: right; margin-top: 8px">
                <ElButton type="danger" link onClick={onRemove}>
                  {t('co.editor.removeLink')}
                </ElButton>
              </div>
            )}
          </FormDialog>
        </>
      );
    };
  },
});
