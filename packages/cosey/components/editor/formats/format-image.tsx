import { computed, defineComponent, reactive, ref, type PropType } from 'vue';
import { ElButton } from 'element-plus';
import { Icon } from '../../icon';
import Button from '../button';
import { ContextMenuContent } from '../../context-menu';
import { chooseFiles } from '../../../utils';
import { FormDialog } from '../../form-dialog';
import { Form, FormItem } from '../../form';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';
import { RtiImage, RtiUpload } from 'richtext-icons';

export default defineComponent({
  name: 'CoEditorFormatImage',
  props: {
    label: { type: String },
    /** 作为上下文菜单项内嵌展示（菜单项样式而非按钮），仅渲染触发器外观差异，弹窗逻辑不变 */
    embedded: { type: Boolean },
    /** 点击触发器后的回调。上下文菜单场景用于在弹出 FormDialog 前先关闭菜单 */
    onTrigger: { type: Function as PropType<() => void | undefined> },
  },
  setup(props) {
    const { t } = useLocale();

    const editor = useEditor();

    const visible = ref(false);

    const actionType = ref<'update' | 'insert'>('insert');

    const isActive = computed(() => {
      void editor.version.value;
      return editor.isImageActive();
    });

    const model = reactive({
      url: '',
      width: '',
      height: '',
    });

    const title = computed(
      () =>
        `${actionType.value === 'update' ? t('co.editor.edit') : t('co.editor.insert')}${t('co.editor.image')}`,
    );

    const onSelect = () => {
      visible.value = false;

      chooseFiles({
        accept: 'image/*',
        multiple: false,
      }).then((files) => {
        files.forEach((file) => {
          editor.insertImage('', file);
        });
      });
    };

    const onClick = () => {
      const attrs = editor.getImageAttrs();

      // 弹出弹窗前先通知外层（上下文菜单）关闭菜单
      props.onTrigger?.();

      if (attrs) {
        Object.assign(model, {
          url: attrs.src || '',
          width: attrs.width ?? '',
          height: attrs.height ?? '',
        });
        actionType.value = 'update';
      } else {
        Object.assign(model, {
          url: '',
          width: '',
          height: '',
        });
        actionType.value = 'insert';
      }

      visible.value = true;
    };

    const onSubmit = () => {
      if (!model.url.trim()) return;

      if (actionType.value === 'update') {
        editor.updateImage({
          src: model.url,
          width: model.width || null,
          height: model.height || null,
        });
      } else {
        editor.insertImage(model.url, undefined, model.width, model.height);
      }
    };

    return () => {
      const label = props.label ?? t('co.editor.image');

      return (
        <>
          {props.embedded ? (
            <ContextMenuContent
              title={label}
              active={isActive.value}
              onClick={onClick}
              v-slots={{ icon: () => <RtiImage /> }}
            />
          ) : (
            <Button active={isActive.value} label={props.label} title={label} onClick={onClick}>
              <Icon>
                <RtiImage />
              </Icon>
            </Button>
          )}

          <FormDialog v-model={visible.value} title={title.value} width="sm">
            <Form model={model} labelWidth="auto" grid rowProps={{ gutter: 16 }} submit={onSubmit}>
              <FormItem
                v-model={model.url}
                prop="url"
                label="URL"
                field-type="input"
                colProps={{ span: 20 }}
              />
              <ElButton text onClick={onSelect}>
                <Icon size="lg">
                  <RtiUpload />
                </Icon>
              </ElButton>
              <FormItem
                v-model={model.width}
                prop="width"
                label={t('co.editor.width')}
                field-type="input"
                colProps={{ span: 12 }}
              />
              <FormItem
                v-model={model.height}
                prop="height"
                label={t('co.editor.height')}
                field-type="input"
                colProps={{ span: 12 }}
              />
            </Form>
          </FormDialog>
        </>
      );
    };
  },
});
