import { getSimpleStyleHook } from '../../../components';

export default getSimpleStyleHook('LayoutMask', (token) => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      position: 'fixed',
      inset: 0,
      zIndex: 1010,
      backgroundColor: token.colorBgMask,
    },
  };
});
