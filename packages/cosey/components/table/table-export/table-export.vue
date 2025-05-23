<template>
  <FormDialog v-bind="mergedProps" width="fit-content" @open="onOpen" @closed="onClosed">
    <Form
      :model="formModel"
      label-width="auto"
      width="lg"
      :submit="onSubmit"
      :class="[hashId, prefixCls]"
    >
      <FormItem v-model="formModel.filename" label="文件名" prop="filename" />
      <FormItem
        v-model="formModel.bookType"
        label="文件类型"
        prop="bookType"
        field-type="select"
        :field-props="{
          options: bookTypeOptions,
          onChange: onBookTypeChange,
        }"
      />
      <FormItem v-model="formModel.fields" label="选择字段" prop="fields">
        <Panel max-height="240px">
          <template #header>
            <el-checkbox
              :model-value="checkAllValue"
              :indeterminate="checkAllIndeterminate"
              @change="onCheckAllChange"
            >
              全部
            </el-checkbox>
          </template>
          <List :node-list="tree" style="--el-checkbox-height: 24px" />
        </Panel>
      </FormItem>
      <FormItem
        v-model="formModel.params"
        label="参数配置"
        prop="params"
        field-type="checkboxgroup"
        :field-props="paramsFieldProps"
      />
    </Form>
  </FormDialog>
</template>

<script lang="ts" setup>
import { computed, mergeProps, reactive, ref, useAttrs } from 'vue';
import { type TableExportEmits, omittedTableExportProps, tableExportProps } from './table-export';
import { reactiveOmit } from '@vueuse/core';
import {
  formatAsBasicDateTime,
  exportExcel,
  bookFormats,
  type ExportBookType,
  type ExportExcelColumn,
  type ExportExcelScheme,
  walkTree,
} from '../../../utils';
import List from './list.vue';
import { type TableColumnProps } from '../table-column/table-column';
import { exportRenderer } from '../table-column/renderer';
import { ElMessage } from 'element-plus';
import { FormDialog } from '../../form-dialog';
import { Form, FormItem } from '../../form';
import { Panel } from '../../panel';

import useStyle from './style';
import { useComponentConfig } from '../../config-provider';
import { CheckableNode, useTreeCheck } from '../../../hooks';

defineOptions({
  name: 'TableExport',
});

const props = defineProps(tableExportProps);

const attrs = useAttrs() as any;

const { prefixCls } = useComponentConfig('table-export');

const { hashId } = useStyle(prefixCls);

const mergedProps = computed(() => {
  return mergeProps(reactiveOmit(props, omittedTableExportProps), attrs);
});

defineEmits<TableExportEmits>();

const getDefaultFilename = () => {
  return '导出-' + formatAsBasicDateTime(new Date());
};

const bookTypeOptions = bookFormats.map((bookType) => {
  return {
    label: `${bookType.label} (*${bookType.ext})`,
    value: bookType.type,
  };
});

type Params = 'head' | 'grouping';

interface ParamOption {
  label: string;
  value: Params;
  checked?: boolean;
}

const mapTypeParamOptions: Record<ExportBookType, ParamOption[]> = {
  csv: [{ label: '表头', value: 'head', checked: true }],
  txt: [{ label: '表头', value: 'head', checked: true }],
  xml: [
    { label: '表头', value: 'head', checked: true },
    { label: '分组表头', value: 'grouping', checked: true },
  ],
  html: [
    { label: '表头', value: 'head', checked: true },
    { label: '分组表头', value: 'grouping', checked: true },
  ],
  xlsx: [
    { label: '表头', value: 'head', checked: true },
    { label: '分组表头', value: 'grouping', checked: true },
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
    .map(({ data: column, children }): ExportExcelColumn => {
      return {
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
      transform(value, column) {
        return exportRenderer(value, column.renderer);
      },
    },
  };
};

const onSubmit = async () => {
  await exportExcel(getScheme(), props.data);

  ElMessage.success('导出成功');
};
</script>
