import { deepAssign, auid } from '../utils';
import { ElMessage } from 'element-plus';
import { cloneDeep, pick } from 'lodash-es';
import {
  type ShallowRef,
  type Ref,
  type ComputedRef,
  type MaybeRefOrGetter,
  computed,
  reactive,
  ref,
  shallowRef,
  useTemplateRef,
  readonly,
  nextTick,
  toValue,
} from 'vue';

import { useLocale } from '../hooks';

const mapTypeTitle = {
  edit: 'co.common.edit',
  add: 'co.common.add',
};

export interface UseUpsertExposeOptions {
  success?: () => any;
}

export interface UseUpsertExpose<Row extends Record<string, any>, Data = any> {
  edit: (row: Row, ...args: any[]) => Promise<void>;
  add: (...args: any[]) => void;
  setData: (data: Data) => UseUpsertExpose<Row, Data>;
  setOptions: (options: UseUpsertExposeOptions) => any;
}

export type UpsertType = 'edit' | 'add';

export interface UseUpsertOptions<Model, Row = Model> {
  title?: MaybeRefOrGetter<string>;
  stuffTitle?: MaybeRefOrGetter<string>;
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
  addSuccessText?: MaybeRefOrGetter<string>;
  editSuccessText?: MaybeRefOrGetter<string>;
}

export interface UseUpsertReturn<
  Model extends Record<string, any>,
  Row extends Record<string, any> = Model,
  Data = any,
> extends UseUpsertExpose<Row, Data> {
  dialogProps: {
    modelValue: boolean;
    'onUpdate:modelValue': (value: boolean) => void;
    title: string;
  };
  formProps: {
    model: Model;
    ref: string;
    submit: () => Promise<void>;
  };
  formRef: Readonly<ShallowRef<any>>;
  data: ShallowRef<Data | undefined>;
  expose: UseUpsertExpose<Row, Data>;
  row: ShallowRef<Row | undefined>;
  type: Readonly<Ref<UpsertType>>;
  isEdit: ComputedRef<boolean>;
  isAdd: ComputedRef<boolean>;
  loading: Readonly<Ref<boolean>>;
}

export function useUpsert<
  Model extends Record<string, any>,
  Row extends Record<string, any> = Model,
  Data = any,
>(options: MaybeRefOrGetter<UseUpsertOptions<Model, Row>>): UseUpsertReturn<Model, Row, Data> {
  // options 可以是对象、ref 或 getter：写成 computed(() => ({ stuffTitle: t('...') }))
  // 即可让标题跟随语言切换。这里是唯一的取值入口，省掉满屏的 unref。
  const _options = computed(() => toValue(options));

  const getModel = () => _options.value.model;

  const { t, lang } = useLocale();

  const type = ref<UpsertType>('add');
  const isEdit = computed(() => type.value === 'edit');
  const isAdd = computed(() => type.value === 'add');

  // dialog
  const visible = ref(false);

  const mergedTitle = computed(() => {
    const { title, stuffTitle } = _options.value;

    return (
      toValue(title) ||
      t(mapTypeTitle[type.value]) +
        (lang.value === 'zh-cn' ? '' : ' ') +
        (toValue(stuffTitle) || '')
    );
  });

  const initialModel = cloneDeep(getModel());

  const modelKeys = Object.keys(initialModel);

  const dialogProps = reactive({
    modelValue: visible,
    'onUpdate:modelValue': (value: boolean) => {
      visible.value = value;
    },
    title: mergedTitle,
  });

  // data
  const data = shallowRef<Data>();
  const row = shallowRef<Row>();
  let addParams: any[] = [];
  let editParams: any[] = [];

  // 打开序号：add / edit 各自自增。只有最后一次打开发起的异步回填和回调生效，
  // 否则连续点两行的「编辑」时，先发出、后返回的详情会覆盖后打开的表单。
  let openSeq = 0;

  // 正在进行的详情回填，提交前要等它结束（详情没回来就提交等于提交重置后的空表单）
  let pendingFill: Promise<void> | null = null;

  // detailsFetch / beforeFill 进行中
  const loading = ref(false);

  // form
  const formRefKey = auid();

  const formRef = useTemplateRef(formRefKey);

  const onSubmit = async () => {
    await pendingFill;

    const { addFetch, editFetch, addSuccessText, editSuccessText, success } = _options.value;

    let res: any;

    if (isAdd.value) {
      res = await addFetch?.(...addParams);
      ElMessage.success(toValue(addSuccessText) || t('co.common.operateSuccess'));
    } else {
      res = await editFetch?.(row.value!, ...editParams);
      ElMessage.success(toValue(editSuccessText) || t('co.common.operateSuccess'));
    }

    success?.(res);
    exposeOptions?.success?.();
  };

  const formProps = reactive({
    model: computed(getModel),
    ref: formRefKey,
    submit: onSubmit,
  });

  // expose
  let exposeOptions: UseUpsertExposeOptions;

  const expose: UseUpsertExpose<Row, Data> = {
    edit: (_row, ...args) => {
      const seq = ++openSeq;
      const target = cloneDeep(_row);
      const opts = _options.value;

      editParams = args;
      type.value = 'edit';
      row.value = target;
      deepAssign(getModel(), initialModel);

      opts.onEdit?.(target, ...args);

      visible.value = true;
      opts.onShow?.();

      nextTick(() => {
        if (seq !== openSeq) return;

        _options.value.onShown?.();
        _options.value.onShownEdit?.(target, ...args);
      });

      const fill = async () => {
        loading.value = true;

        try {
          let filledRow: any = target;

          if (opts.detailsFetch) {
            filledRow = await opts.detailsFetch(target);
          }
          if (seq !== openSeq) return;

          filledRow = cloneDeep(filledRow);
          filledRow = (await opts.beforeFill?.(filledRow)) || filledRow;
          if (seq !== openSeq) return;

          Object.assign(getModel(), pick(filledRow, modelKeys));
        } catch (err) {
          console.error(err);

          // 详情取不到，留着空表单容易被误提交
          if (seq === openSeq) {
            visible.value = false;
          }
        } finally {
          if (seq === openSeq) {
            loading.value = false;
          }
        }
      };

      const task = fill();

      const clear = () => {
        if (pendingFill === tracked) {
          pendingFill = null;
        }
      };

      const tracked = task.then(clear, clear);
      pendingFill = tracked;

      return tracked;
    },
    add: (...args) => {
      const seq = ++openSeq;
      const opts = _options.value;

      addParams = args;
      type.value = 'add';
      row.value = undefined;
      deepAssign(getModel(), initialModel);

      // 上一次 edit 的回填已被序号作废，它不会再把 loading 关掉
      loading.value = false;

      opts.onAdd?.(...args);

      visible.value = true;
      opts.onShow?.();

      nextTick(() => {
        if (seq !== openSeq) return;

        _options.value.onShown?.();
        _options.value.onShownAdd?.(...args);
      });
    },
    setData: (_data: Data) => {
      data.value = _data;
      return expose;
    },
    setOptions: (options: UseUpsertExposeOptions) => {
      exposeOptions = { ...exposeOptions, ...options };
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
    loading: readonly(loading),
  };

  return result;
}

export interface UseExternalUpsertOptions {
  success?: () => any;
}

export interface UseExternalUpsertReturn<Row extends Record<string, any>, Data> {
  add: (...args: any[]) => void;
  edit: (row: Row, ...args: any[]) => Promise<void>;
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

  const edit = async (row: Row, ...args: any[]) => {
    await expose.value?.edit(row, ...args);
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
