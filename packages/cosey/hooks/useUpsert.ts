import { deepAssign, auid } from '../utils';
import { ElMessage } from 'element-plus';
import { cloneDeep, pick } from 'lodash-es';
import {
  type ShallowRef,
  type Ref,
  type ComputedRef,
  type MaybeRef,
  computed,
  reactive,
  ref,
  shallowRef,
  useTemplateRef,
  unref,
  readonly,
  nextTick,
} from 'vue';

import { useLocale } from '../hooks';
import { toRefs } from '@vueuse/core';

const mapTypeTitle = {
  edit: 'co.common.edit',
  add: 'co.common.add',
};

export interface UseUpsertExposeOptions {
  success?: () => any;
}

export interface UseUpsertExpose<Row extends Record<string, any>, Data = any> {
  edit: (row: Row, ...args: any[]) => any;
  add: (...args: any[]) => any;
  setData: (data: Data) => UseUpsertExpose<Row, Data>;
  setOptions: (options: UseUpsertExposeOptions) => any;
}

export type UpsertType = 'edit' | 'add';

export interface UseUpsertOptions<Model, Row = Model> {
  title?: string;
  stuffTitle?: string;
  model: Model;
  onAdd?: (...args: any[]) => void;
  onEdit?: (row: Row, ...args: any[]) => void;
  onShow?: () => void;
  onShown?: () => void;
  onShownAdd?: (...args: any[]) => void;
  onShownEdit?: (row: Row, ...args: any[]) => void;
  detailsFetch?: (row: Row) => any;
  beforeFill?: (row: Row) => any;
  addFetch?: (...args: any[]) => any;
  editFetch?: (row: Row, ...args: any[]) => any;
  success?: (res: any) => any;
  addSuccessText?: string;
  editSuccessText?: string;
}

export interface UseUpsertReturn<
  Model extends Record<string, any>,
  Row extends Record<string, any> = Model,
  Data = any,
> extends UseUpsertExpose<Row, Data> {
  dialogProps: {
    modelvalue: boolean;
    'onUpdate:modelValue': (value: boolean) => void;
    title: string;
  };
  formProps: {
    model: Model;
    ref: string;
    submit: () => Promise<void>;
  };
  formRef: any;
  data: Ref<Data | undefined>;
  expose: UseUpsertExpose<Row, Data>;
  row: ShallowRef<Row | undefined>;
  type: Readonly<Ref<UpsertType>>;
  isEdit: ComputedRef<boolean>;
  isAdd: ComputedRef<boolean>;
}

export function useUpsert<
  Model extends Record<string, any>,
  Row extends Record<string, any> = Model,
  Data = any,
>(options: MaybeRef<UseUpsertOptions<Model, Row>>): UseUpsertReturn<Model, Row, Data> {
  const {
    model,
    stuffTitle,
    title,
    addSuccessText,
    editSuccessText,
    onAdd,
    onEdit,
    onShow,
    onShown,
    onShownAdd,
    onShownEdit,
    detailsFetch,
    beforeFill,
    addFetch,
    editFetch,
    success,
  } = toRefs(computed(() => unref(options)));

  const { t, lang } = useLocale();

  const type = ref<UpsertType>('add');
  const isEdit = computed(() => type.value === 'edit');
  const isAdd = computed(() => type.value === 'add');

  // dialog
  const visible = ref(false);

  const mergedTitle = computed(() => {
    return (
      unref(title) ||
      t(mapTypeTitle[type.value]) + (lang.value === 'zh-cn' ? '' : ' ') + (unref(stuffTitle) || '')
    );
  });

  const initialModel = cloneDeep(unref(model));

  const modelKeys = Object.keys(initialModel);

  const dialogProps = reactive({
    modelValue: visible,
    'onUpdate:modelValue': (value: boolean) => {
      visible.value = value;
    },
    title: mergedTitle,
  }) as unknown as UseUpsertReturn<Model, Row, Data>['dialogProps'];

  // data
  const data = shallowRef<Data>();
  const row = shallowRef<Row>();
  let addParams: any[] = [];
  let editParams: any[] = [];

  // form
  const formRefKey = auid();

  const formRef = useTemplateRef(formRefKey);

  const onSubmit = async () => {
    let res: any;

    if (type.value === 'add') {
      res = await unref(addFetch)?.(...addParams);
      ElMessage.success(unref(addSuccessText) || t('co.common.operateSuccess'));
    } else {
      res = await unref(editFetch)?.(row.value!, ...editParams);
      ElMessage.success(unref(editSuccessText) || t('co.common.operateSuccess'));
    }

    unref(success)?.(res);
    exposeOptions?.success?.();
  };

  const formProps = reactive({
    model,
    ref: formRefKey,
    submit: onSubmit,
  }) as unknown as UseUpsertReturn<Model, Row, Data>['formProps'];

  // expose
  let exposeOptions: UseUpsertExposeOptions;

  const expose: UseUpsertExpose<Row, Data> = {
    edit: async (_row, ...args) => {
      editParams = args;
      type.value = 'edit';
      row.value = cloneDeep(_row);
      deepAssign(unref(model), initialModel);

      unref(onEdit)?.(row.value, ...editParams);

      visible.value = true;
      unref(onShow)?.();

      nextTick(() => {
        unref(onShown)?.();
        unref(onShownEdit)?.(_row, ...editParams);
      });

      let filledRow = row.value;
      if (unref(detailsFetch)) {
        filledRow = await unref(detailsFetch)!(row.value);
      }
      filledRow = cloneDeep(filledRow);
      filledRow = (await unref(beforeFill)?.(filledRow)) || filledRow;
      Object.assign(unref(model), pick(filledRow, modelKeys));
    },
    add: (...args) => {
      addParams = args;
      type.value = 'add';
      row.value = undefined;
      deepAssign(unref(model), initialModel);

      unref(onAdd)?.(...addParams);

      visible.value = true;
      unref(onShow)?.();

      nextTick(() => {
        unref(onShown)?.();
        unref(onShownAdd)?.(...addParams);
      });
    },
    setData: (_data: Data) => {
      data.value = _data;
      return expose;
    },
    setOptions: (options: UseUpsertExposeOptions) => {
      exposeOptions = options;
    },
  };

  const result: UseUpsertReturn<Model, Row, Data> = {
    ...expose,
    dialogProps,
    formProps,
    formRef,
    data,
    expose,
    row,
    type: readonly(type),
    isEdit,
    isAdd,
  };

  return result;
}

export interface UseExternalUpsertOptions {
  success?: () => any;
}

export interface UseExternalUpsertReturn<Row extends Record<string, any>, Data> {
  add: (...args: any[]) => void;
  edit: (...args: any[]) => void;
  setData: (data: Data) => void;
  expose: Readonly<ShallowRef<UseUpsertExpose<Row, Data> | null>>;
  ref: (_expose: any) => void;
}

export function useOuterUpsert<Row extends Record<string, any>, Data>(
  options: UseExternalUpsertOptions = {},
): UseExternalUpsertReturn<Row, Data> {
  const expose = ref<UseUpsertExpose<Row, Data> | null>(null);

  const vnodeRef = (_expose: UseUpsertExpose<Row, Data> | null) => {
    expose.value = _expose;

    if (_expose) {
      _expose.setOptions(options);
    }
  };

  const add = (...args: any) => {
    expose.value?.add(...args);
  };

  const edit = (row: Row, ...args: any) => {
    expose.value?.edit(row, ...args);
  };

  const setData = (data: Data) => {
    expose.value?.setData(data);
  };

  const result = {
    add,
    edit,
    setData,
    expose,
    ref: vnodeRef,
  };

  return result;
}
