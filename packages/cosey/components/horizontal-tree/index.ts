import { withInstall } from '../utils';
import HorizontalTree from './horizontal-tree.vue';

export * from './horizontal-tree';

const _HorizontalTree = withInstall(HorizontalTree);

export { _HorizontalTree as HorizontalTree };
export default _HorizontalTree;
