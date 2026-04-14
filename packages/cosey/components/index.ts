export * from './audio-card';
export * from './audio-viewer';
export * from './card';
export * from './close';
export * from './col';
export * from './config-provider';
export * from './container';
export * from './context-menu';
export * from './copy';
export * from './cssinjs';
export * from './descriptions';
export * from './dnd-sort';
export * from './editor';
export * from './editor';
export * from './field';
export * from './file-card';
export * from './form';
export * from './form-dialog';
export * from './form-drawer';
export * from './form-group';
export * from './form-list';
export * from './form-query';
export * from './highlight';
export * from './horizontal-tree';
export * from './icon';
export * from './iconify-icon';
export * from './image-card';
export * from './input-number-range';
export * from './long-text';
export * from './mask';
export * from './media-card';
export * from './media-card-group';
export * from './media-viewer';
export * from './number-format';
export * from './only-child';
export * from './optional-wrapper';
export * from './panel';
export * from './remote-select';
export * from './ribbon';
export * from './row';
export * from './scroll-view';
export * from './snug-menu';
export * from './stack-dialog';
export * from './style';
export * from './svg-icon';
export * from './table';
export * from './table-action';
export * from './table/table-query';
export * from './theme';
export * from './toggle';
export * from './transition';
export * from './transition-group';
export * from './upload';
export * from './video-card';
export * from './video-viewer';
export * from './week-range-picker';

import { type App } from 'vue';
import * as components from './components';

const installer = {
  install(app: App) {
    Object.keys(components).forEach((key) => {
      app.use((components as any)[key]);
    });
  },
};

export { components };

export default installer;
