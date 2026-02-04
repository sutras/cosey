import { type ButtonProps, dropdownItemProps, popconfirmProps } from 'element-plus';
import { type PropType, type ExtractPropTypes, type VNodeChild, ExtractPublicPropTypes } from 'vue';

export type TableActionDropdownItem = Omit<
  ExtractPublicPropTypes<typeof dropdownItemProps>,
  'icon'
> & {
  visible?: boolean;
  label?: VNodeChild;
  icon?: string;
  appendIcon?: string;
  onClick?: (event: MouseEvent) => void;
};

export interface TableActionItemProps extends Partial<ButtonProps> {
  label?: string;
  popconfirm?: Partial<ExtractPropTypes<typeof popconfirmProps>> & {
    confirm?: (event: MouseEvent) => any;
    cancel?: (event: MouseEvent) => void;
  };
  onClick?: (event: MouseEvent) => void;
  hidden?: boolean;
  visible?: boolean;
  icon?: string;
  appendIcon?: string;
  dropdown?: TableActionDropdownItem[];
}

export const defaultTableActionItemProps: TableActionItemProps = {
  link: true,
  type: 'primary',
};

export const tableActionItemProps = {
  props: {
    type: Object as PropType<TableActionItemProps>,
  },
};
