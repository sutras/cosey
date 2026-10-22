import { type ExtractPropTypes, type PropType, type SlotsType } from 'vue';
import { type ECOption } from '../../utils/echarts';

export const chartProps = {
  /** echarts 配置 */
  option: {
    type: Object as PropType<ECOption>,
  },
  /** 高度，默认 320 */
  height: {
    type: [String, Number] as PropType<string | number>,
    default: 320,
  },
  loading: {
    type: Boolean,
  },
  loadingText: {
    type: String,
  },
  /** 无数据状态（`option` 为空时也可自行传 `true`） */
  empty: {
    type: Boolean,
  },
  emptyText: {
    type: String,
  },
  /** 加载时是否用骨架屏替代图表，默认 `true` */
  skeleton: {
    type: Boolean,
    default: true,
  },
  /** 右上角导出图片按钮 */
  toolbar: {
    type: Boolean,
  },
  /**
   * 导出图片的文件名，默认 `chart.png`。
   *
   * 传 `false` 表示只触发 `export` 事件、不自动下载（适合自己上传到服务端）。
   */
  exportFilename: {
    type: [String, Boolean] as PropType<string | false>,
    default: 'chart.png',
  },
  /** 导出图片的背景色 */
  backgroundColor: {
    type: String,
    default: 'transparent',
  },
  /** `option` 变化时是否合并，默认 `true`；`false` 表示整体替换 */
  merge: {
    type: Boolean,
    default: true,
  },
};

export type ChartProps = ExtractPropTypes<typeof chartProps>;

export interface ChartSlots {
  default: { chart: any; exportImage: () => void };
}

export const chartSlots = Object as SlotsType<ChartSlots>;

export const chartEmits = {
  export: (url: string) => typeof url === 'string',
};
