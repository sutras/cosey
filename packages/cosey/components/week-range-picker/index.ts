import { enhanceComponent, type EnhancedComponent } from '../utils';
import WeekRangePicker from './week-range-picker';

export * from './week-range-picker.api';

const _WeekRangePicker: EnhancedComponent<typeof WeekRangePicker> =
  enhanceComponent(WeekRangePicker);

export { _WeekRangePicker as WeekRangePicker };
export default _WeekRangePicker;
