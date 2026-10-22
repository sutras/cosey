import { type App, type Component } from 'vue';
import { ComponentProps } from '../type-helpers';
import { isPlainObject } from '../utils';

export type EnhancedComponent<T extends Component> = T & {
  install: (app: App<any>) => void;
  setPropsDefaults: (defaults: ComponentProps<T>) => void;
};

export function enhanceComponent<T extends Component>(component: T): EnhancedComponent<T> {
  let props = (component as any).props;

  props = Array.isArray(props) ? props.reduce((obj, key) => ((obj[key] = {}), obj), {}) : props;

  return Object.assign(component, {
    install(app: App) {
      app.component(component.name as string, component);
    },
    setPropsDefaults(defaults: Record<string, any>) {
      if (!props) return;

      for (const [key, value] of Object.entries(defaults)) {
        if (!Object.hasOwn(props, key)) {
          continue;
        }

        const prop = props[key];

        if (isPlainObject(prop)) {
          props[key] = {
            ...prop,
            default: value,
          };
          continue;
        }

        props[key] = {
          type: prop,
          default: value,
        };
      }

      (component as any).props = props;
    },
  });
}
