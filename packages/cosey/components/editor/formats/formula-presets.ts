export const formulas = [
  {
    name: '傅里叶级数',
    formula:
      'f(x) = {{{a_0}} \\over 2} + \\sum\\limits_{n = 1}^\\infty  {({a_n}\\cos {nx} + {b_n}\\sin {nx})}',
  },
  {
    name: '泰勒展开式',
    formula:
      'e ^ { x } = 1 + \\frac { x } { 1 ! } + \\frac { x ^ { 2 } } { 2 ! } + \\frac { x ^ { 3 } } { 3 ! } + \\cdots , \\quad - \\infty < x < \\infty',
  },
  {
    name: '高斯公式',
    formula:
      '\\iiint _ { \\Omega } \\left( \\frac { \\partial {P} } { \\partial {x} } + \\frac { \\partial {Q} } { \\partial {y} } + \\frac { \\partial {R} }{ \\partial {z} } \\right) \\mathrm { d } V = \\oint _ { \\partial \\Omega } ( P \\cos \\alpha + Q \\cos \\beta + R \\cos \\gamma ) \\mathrm{ d} S',
  },
  {
    name: '定积分',
    formula:
      '\\lim\\limits_ { n \\rightarrow + \\infty } \\sum _ { i = 1 } ^ { n } f \\left[ a + \\frac { i } { n } ( b - a ) \\right] \\frac { b - a } { n } = \\int _ { a } ^ { b } f ( x ) dx',
  },
  {
    name: '和的展开式',
    formula:
      '( 1 + x ) ^ { n } = 1 + \\frac { n x } { 1 ! } + \\frac { n ( n - 1 ) x ^ { 2 } } { 2 ! } + \\cdots',
  },
  {
    name: '三角恒等式1',
    formula:
      '\\sin \\alpha \\pm \\sin \\beta = 2 \\sin \\frac { 1 } { 2 } ( \\alpha \\pm \\beta ) \\cos \\frac { 1 } { 2 } ( \\alpha \\mp \\beta )',
  },
  {
    name: '三角恒等式2',
    formula:
      '\\cos \\alpha + \\cos \\beta = 2 \\cos \\frac { 1 } { 2 } ( \\alpha + \\beta ) \\cos \\frac { 1 } { 2 } ( \\alpha - \\beta )',
  },
  {
    name: '欧拉公式',
    formula: '{e^{ix}} = \\cos {x} + i\\sin {x}',
  },
  {
    name: '格林公式',
    formula:
      '\\int\\!\\!\\!\\int\\limits_D {({{\\partial Q} \\over {\\partial x}} - {{\\partial P} \\over {\\partial y}})dxdy = \\oint\\limits_L {Pdx + Qdy} }',
  },
  {
    name: '贝努力方程',
    formula: '{{dy} \\over {dx}} + P(x)y = Q(x){y^n}(n \\ne 0,1)',
  },
  {
    name: '全微分方程',
    formula: 'du(x,y) = P(x,y)dx + Q(x,y)dy = 0',
  },
  {
    name: '非齐次方程',
    formula: 'y = (\\int {Q(x){e^{\\int {P(x)dx} }}dx + C){e^{ - \\int {P(x)dx} }}}',
  },
  {
    name: '柯西中值定理',
    formula: "\\frac{{f(b) - f(a)}}{{F(b) - F(a)}} = \\frac{{f'(\\xi )}}{{F'(\\xi )}}",
  },
  {
    name: '拉格朗日中值定理',
    formula: "f(b) - f(a) = f'(\\xi )(b - a)",
  },
  {
    name: '曲面面积',
    formula:
      'A = \\int\\!\\!\\!\\int\\limits_D {\\sqrt {1 + {{\\left( {{{\\partial z} \\over {\\partial x}}} \\right)}^2} + {{\\left( {{{\\partial z} \\over {\\partial y}}} \\right)}^2}} dxdy}',
  },
  {
    name: '重积分',
    formula:
      "\\int\\!\\!\\!\\int\\limits_D {f(x,y)dxdy}  = \\int\\!\\!\\!\\int\\limits_{D'} {f(r\\cos \\theta ,r\\sin \\theta )rdrd\\theta }",
  },
  {
    name: '导数公式',
    formula: "(\\arcsin x)' = \\frac{1}{{\\sqrt {1 - {x^2}} }}",
  },
  {
    name: '三角函数积分',
    formula: '\\int {tgxdx =  - \\ln \\left| {\\cos x} \\right| + C}',
  },
  {
    name: '二次曲面',
    formula: '\\frac{{{x^2}}}{{{a^2}}} + \\frac{{{y^2}}}{{{b^2}}} - \\frac{{{z^2}}}{{{c^2}}} = 1',
  },
  {
    name: '二阶微分',
    formula: '{{{d^2}y} \\over {d{x^2}}} + P(x){{dy} \\over {dx}} + Q(x)y = f(x)',
  },
  {
    name: '方向导数',
    formula:
      '\\frac{{\\partial f}}{{\\partial l}} = \\frac{{\\partial f}}{{\\partial x}}\\cos \\phi  + \\frac{{\\partial f}}{{\\partial y}}\\sin \\phi',
  },
];
