import { PropOptions } from '../decorators/prop.decorator.js';

export interface PropertyMetadata {
  target: Function;
  propertyKey: string;
  options: PropOptions;
}
