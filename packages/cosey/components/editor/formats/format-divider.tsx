import { defineComponent } from 'vue';
import { Icon } from '../../icon';
import Button from '../ui/button';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';
import { RtiDivider } from 'richtext-icons';

export default defineComponent({
  name: 'CoEditorFormatDivider',
  props: {
    label: { type: String },
  },
  setup(props) {
    const editor = useEditor();
    const { t } = useLocale();

    // 分割线是插入动作，没有「已生效」的开关状态，所以不接 active
    const onClick = () => {
      editor.insertDivider();
    };

    return () => {
      return (
        <Button label={props.label} title={props.label ?? t('co.editor.divider')} onClick={onClick}>
          <Icon>
            <RtiDivider />
          </Icon>
        </Button>
      );
    };
  },
});
