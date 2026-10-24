import { enhanceComponent, type EnhancedComponent } from '../utils';
import { Typography, TypographyParagraph, TypographyText, TypographyTitle } from './typography';
import LongText from './long-text';

export * from './typography.api';

const _Typography: EnhancedComponent<typeof Typography> = enhanceComponent(Typography);
const _TypographyText: EnhancedComponent<typeof TypographyText> = enhanceComponent(TypographyText);
const _TypographyTitle: EnhancedComponent<typeof TypographyTitle> =
  enhanceComponent(TypographyTitle);
const _TypographyParagraph: EnhancedComponent<typeof TypographyParagraph> =
  enhanceComponent(TypographyParagraph);
const _LongText: EnhancedComponent<typeof LongText> = enhanceComponent(LongText);

export {
  _Typography as Typography,
  _TypographyText as TypographyText,
  _TypographyTitle as TypographyTitle,
  _TypographyParagraph as TypographyParagraph,
  /** @deprecated 用 `TypographyParagraph` + `ellipsis` */
  _LongText as LongText,
};
export default _Typography;
