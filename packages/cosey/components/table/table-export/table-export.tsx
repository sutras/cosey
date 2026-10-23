import { computed, defineComponent, mergeProps, reactive, ref } from 'vue';
import { omittedTableExportProps, tableExportEmits, tableExportProps } from './table-export.api';
import { reactiveOmit } from '@vueuse/core';
import {
  type ExportBookType,
  type ExportExcelScheme,
  formatAsBasicDateTime,
  exportExcel,
  bookFormats,
  walkTree,
  isObject,
  createBem,
} from '../../../utils';
import List from './list';
import { type TableColumnProps } from '../table-column/table-column.api';
import { exportRenderer } from '../table-column/renderer';
import { ElCheckbox, ElMessage } from 'element-plus';
import { FormDialog } from '../../form-dialog';
import { Form, FormItem } from '../../form';
import { Card } from '../../card';

import { CheckableNode, useTreeCheck } from '../../../hooks';
import { useLocale } from '../../../hooks';

export default defineComponent({
  name: 'CoTableExport',
  props: tableExportProps,
  emits: tableExportEmits,
  setup(props, { attrs, emit }) {
    const bem = createBem('table-export');

    const { t } = useLocale();

    const mergedProps = computed(() => {
      return mergeProps(reactiveOmit(props, omittedTableExportProps), attrs);
    });

    const filename = computed(() => {
      return isObject(props.config) ? props.config.filename : '';
    });

    const getDefaultFilename = () => {
      return filename.value || `${t('co.table.export')}-` + formatAsBasicDateTime(new Date());
    };

    const bookTypeOptions = computed(() =>
      bookFormats.map((bookType) => {
        return {
          label: `${t(bookType.label)} (*${bookType.ext})`,
          value: bookType.type,
        };
      }),
    );

    type Params = 'head' | 'grouping';

    interface ParamOption {
      label: string;
      value: Params;
      checked?: boolean;
    }

    const mapTypeParamOptions: Record<ExportBookType, ParamOption[]> = {
      csv: [{ label: t('co.table.header'), value: 'head', checked: true }],
      txt: [{ label: t('co.table.header'), value: 'head', checked: true }],
      xml: [
        { label: t('co.table.header'), value: 'head', checked: true },
        { label: t('co.table.groupHeader'), value: 'grouping', checked: true },
      ],
      html: [
        { label: t('co.table.header'), value: 'head', checked: true },
        { label: t('co.table.groupHeader'), value: 'grouping', checked: true },
      ],
      xlsx: [
        { label: t('co.table.header'), value: 'head', checked: true },
        { label: t('co.table.groupHeader'), value: 'grouping', checked: true },
      ],
    };

    const paramOptions = ref<ParamOption[]>([]);

    const paramsFieldProps = computed(() => {
      return {
        options: paramOptions.value,
      };
    });

    const formModel = reactive<{
      filename: string;
      bookType: ExportBookType;
      fields: string[];
      params: Params[];
    }>({
      filename: getDefaultFilename(),
      bookType: 'csv',
      fields: props.columns.map((column) => column.prop!).filter(Boolean),
      params: [],
    });

    const setInitialData = () => {
      paramOptions.value = mapTypeParamOptions[formModel.bookType];

      formModel.params = paramOptions.value
        .filter((option) => option.checked)
        .map((option) => option.value);
    };

    const onBookTypeChange = () => {
      setInitialData();
    };

    const onClosed = () => {
      setInitialData();

      formModel.filename = getDefaultFilename();
    };

    setInitialData();

    // fields check

    const {
      tree,
      checkAllValue,
      checkAllIndeterminate,
      onCheckAllChange,
      initialize,
      setCheckedByNode,
    } = useTreeCheck<TableColumnProps>({
      childrenKey: 'columns',
      initialChecked: true,
    });

    const setUncheckedIfHiden = () => {
      walkTree(tree.value, 'children', (node) => {
        const hidden = !!node.data.hidden;
        if (hidden) {
          setCheckedByNode(node, false);
        }
      });
    };

    const onOpen = () => {
      initialize(props.columns);
      setUncheckedIfHiden();
    };

    // export
    function transformColumns(nodeList: CheckableNode<TableColumnProps>[] = []) {
      return nodeList
        .filter((node) => node.checkedStatus !== 'unchecked')
        .map(({ data: column, children }): TableColumnProps => {
          return {
            ...column,
            label: column.label || '',
            prop: column.prop || '',
            columns: column.columns ? transformColumns(children) : undefined,
            renderer: column.renderer,
          };
        });
    }

    const getScheme = (): ExportExcelScheme => {
      return {
        filename: formModel.filename || getDefaultFilename(),
        bookType: formModel.bookType,
        worksheet: {
          name: 'sheet',
          columns: transformColumns(tree.value),
          noGroup: !formModel.params.includes('grouping'),
          noHead: !formModel.params.includes('head'),
          transform: exportRenderer,
        },
      };
    };

    const onSubmit = async () => {
      await exportExcel(getScheme(), props.data, {
        footerCount: props.footerCount,
      });

      ElMessage.success(t('co.common.exportSuccess'));
    };

    return () => {
      return (
        <FormDialog
          {...mergedProps.value}
          width="fit-content"
          onOpen={onOpen}
          onClosed={onClosed}
          onUpdate:modelValue={(value) => emit('update:modelValue', value)}
        >
          <Form model={formModel} label-width="auto" width="lg" submit={onSubmit} class={bem.b()}>
            <FormItem label={t('co.table.filename')} prop="filename" />
            <FormItem
              v-model={formModel.bookType}
              label={t('co.table.fileType')}
              prop="bookType"
              field-type="select"
              field-props={{
                options: bookTypeOptions.value,
                onChange: onBookTypeChange,
              }}
            />
            <FormItem v-model={formModel.fields} label={t('co.table.selectField')} prop="fields">
              <Card
                size="small"
                maxHeight="240px"
                collapsible={false}
                v-slots={{
                  title: () => (
                    <ElCheckbox
                      modelValue={checkAllValue.value}
                      indeterminate={checkAllIndeterminate.value}
                      onChange={onCheckAllChange}
                    >
                      {t('co.common.checkAll')}
                    </ElCheckbox>
                  ),
                  default: () => <List nodeList={tree.value} style="--el-checkbox-height: 24px" />,
                }}
              />
            </FormItem>
            <FormItem
              v-model={formModel.params}
              label={t('co.table.paramConfig')}
              prop="params"
              field-type="checkboxgroup"
              field-props={paramsFieldProps.value}
            />
          </Form>
        </FormDialog>
      );
    };
  },
});
