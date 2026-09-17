export type ListType = 'numbered-list' | 'bulleted-list';

export const HEADING_TYPES = [
  'heading-one',
  'heading-two',
  'heading-three',
  'heading-four',
  'heading-five',
  'heading-six',
] as const;

export const HEADING_WITH_PARA_TYPES = ['paragraph', ...HEADING_TYPES] as const;

export type HeadingParagraphType = (typeof HEADING_WITH_PARA_TYPES)[number];

export type HeadingType = (typeof HEADING_TYPES)[number];

export type FormatAlign = 'start' | 'end' | 'left' | 'center' | 'right' | 'justify';

export const mapHeadingTypeToLevel: Record<HeadingType, number> = {
  'heading-one': 1,
  'heading-two': 2,
  'heading-three': 3,
  'heading-four': 4,
  'heading-five': 5,
  'heading-six': 6,
};

export const mapLevelToHeadingType: Record<number, HeadingType> = {
  1: 'heading-one',
  2: 'heading-two',
  3: 'heading-three',
  4: 'heading-four',
  5: 'heading-five',
  6: 'heading-six',
};
