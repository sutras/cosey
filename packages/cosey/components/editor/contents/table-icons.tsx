// prosemirror-tables 只提供命令，工具条的图标得自己画。
// 统一 32×32 视图盒并铺满画布，这样和 @cosey/icons 里的图标放在一起不会显得忽大忽小。
// 注意 Vue 的 SVG 属性名是连字符形式，写成驼峰会变成无效的 SVG 属性。

const svgProps = {
  viewBox: '0 0 32 32',
  width: '1em',
  height: '1em',
  'aria-hidden': true,
};

const frameProps = {
  x: 5,
  y: 6,
  width: 22,
  height: 20,
  rx: 1,
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 2,
};

const lineProps = { fill: 'none', stroke: 'currentColor', 'stroke-width': 2 };

/** 合并单元格：虚线分隔 + 两侧箭头指向中间 */
export const mergeCellsIcon = () => (
  <svg {...svgProps}>
    <rect {...frameProps} />
    <path d="M16 6v20" {...lineProps} stroke-dasharray="3 3" />
    <path d="M9 16h5M11 13l3 3-3 3M23 16h-5M21 13l-3 3l3 3" {...lineProps} stroke-linecap="round" />
  </svg>
);

/** 拆分单元格：实线分隔 + 箭头向两侧分开 */
export const splitCellIcon = () => (
  <svg {...svgProps}>
    <rect {...frameProps} />
    <path d="M16 6v20" {...lineProps} />
    <path
      d="M14 16H9M12 13l-3 3l3 3M18 16h5M20 13l3 3l-3 3"
      {...lineProps}
      stroke-linecap="round"
    />
  </svg>
);

/** 首行作为标题行 */
export const headerRowIcon = () => (
  <svg {...svgProps}>
    <rect {...frameProps} />
    <path d="M6 7h20v5H6z" fill="currentColor" />
    <path d="M6 12h20M16 12v13" {...lineProps} />
  </svg>
);

/** 首列作为标题列 */
export const headerColumnIcon = () => (
  <svg {...svgProps}>
    <rect {...frameProps} />
    <path d="M6 7h5v18H6z" fill="currentColor" />
    <path d="M11 7v18M11 17h15" {...lineProps} />
  </svg>
);

/** 单个单元格作为标题单元格 */
export const headerCellIcon = () => (
  <svg {...svgProps}>
    <rect {...frameProps} />
    <path d="M6 7h5v5H6z" fill="currentColor" />
    <path d="M11 12v13M6 12h20" {...lineProps} />
  </svg>
);

/** 单元格底色：左下角的方块会填成当前底色 */
export const cellBackgroundIcon = (color: string | null) => () => (
  <svg {...svgProps}>
    <rect {...frameProps} />
    <path d="M6 17h9v8H6z" fill={color || 'none'} stroke="currentColor" stroke-width="2" />
    <path d="M16 6v20M6 16h20" {...lineProps} />
  </svg>
);

/**
 * 单元格文字色：单元格属性里的字色是给 <td> 加 color，靠继承生效，
 * 所以图标用「A + 当前色条」表示文字颜色，和全局字体颜色的表达一致。
 */
export const cellTextColorIcon = (color: string | null) => () => (
  <svg {...svgProps}>
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M16 6 9 23h2.9l1.4-4.2h5.4L20.1 23H23zM13.8 16.6h4.4L16 11z"
    />
    <path d="M7 26h18v3H7z" fill={color || 'currentColor'} opacity={color ? 1 : 0.3} />
  </svg>
);

/** 单元格垂直对齐：把两行文字放在偏上/居中/偏下的位置 */
export const verticalAlignIcon = (top: number) => () => (
  <svg {...svgProps}>
    <rect {...frameProps} />
    <path d={`M9 ${top}h14v4H9z`} fill="currentColor" />
    <path d={`M9 ${top + 6}h14v4H9z`} fill="currentColor" />
  </svg>
);

export const verticalAlignTopIcon = verticalAlignIcon(7);
export const verticalAlignMiddleIcon = verticalAlignIcon(12);
export const verticalAlignBottomIcon = verticalAlignIcon(15);
