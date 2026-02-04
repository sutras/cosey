import { type ExtractPublicPropTypes, type PropType } from 'vue';
import { type TableActionItemProps } from './item.api';

type TableActionItemAtom =
  | TableActionItemProps
  | null
  | undefined
  | boolean
  | TableActionItemAtom[];

export const tableActionProps = {
  actions: {
    type: Array as PropType<TableActionItemAtom[] | TableActionItemAtom[][]>,
    default: () => [],
  },
  divider: {
    type: Boolean,
    default: undefined,
  },
};

export type TableActionProps = ExtractPublicPropTypes<typeof tableActionProps>;

export interface TableActionConfig {
  itemProps?: TableActionItemProps;
  divider?: boolean;
}

export const defaultTableActionProps: TableActionProps = {
  divider: true,
};
