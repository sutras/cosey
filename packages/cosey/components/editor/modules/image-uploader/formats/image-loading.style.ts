import { getGlobalStyleHook } from '../../../../theme';
import { rotation, spinner } from '../../../../style';

export default getGlobalStyleHook('EditorImageLoading', (token) => {
  return {
    '.co-editor-image-loading': {
      position: 'relative',
      display: 'inline-block',

      img: {
        maxWidth: '98%',
        filter: 'blur(5px)',
        opacity: 0.3,
        pointerEvents: 'none',
      },

      div: {
        position: 'absolute',
        insetBlockStart: '50%',
        width: '100%',
        marginBlockStart: -20,
        textAlign: 'center',

        svg: {
          display: 'inline',
          height: 42,
          width: 42,
          animationName: rotation,
          animationDuration: '2s',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',

          circle: {
            animationName: spinner,
            animationDuration: '1.5s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            strokeDasharray: '90, 150',
            strokeDashoffset: 0,
            strokeWidth: 2,
            stroke: token.colorPrimary,
            strokeLinecap: 'round',
          },
        },
      },
    },
  };
});
