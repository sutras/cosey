import { enhanceComponent, type EnhancedComponent } from '../utils';
import FormSteps from './form-steps';
import FormStep from './form-step.vue';

export * from './form-steps.api';

const _FormSteps: EnhancedComponent<typeof FormSteps> = enhanceComponent(FormSteps);
const _FormStep: EnhancedComponent<typeof FormStep> = enhanceComponent(FormStep);

export { _FormSteps as FormSteps, _FormStep as FormStep };
export default _FormSteps;
