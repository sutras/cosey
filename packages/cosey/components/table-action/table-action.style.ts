import { getSimpleStyleHook } from '../theme';

export default getSimpleStyleHook('CoTableAction', (token) => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      display: 'inline-flex',
      flexDirection: 'column',
      rowGap: token.sizeSM,

      [`${componentCls}-row`]: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        columnGap: token.sizeXS,
        rowGap: token.sizeXXS,

        '&.is-divider': {
          columnGap: 0,
        },
      },
    },
  };
});
