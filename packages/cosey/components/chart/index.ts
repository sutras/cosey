import { enhanceComponent, type EnhancedComponent } from '../utils';
import CoChart from './chart';

export * from './chart.api';

const _CoChart: EnhancedComponent<typeof CoChart> = enhanceComponent(CoChart);

export { _CoChart as CoChart };
export default _CoChart;
