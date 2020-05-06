import { PropOptions } from '../decorators/prop.decorator';

export interface PropertyMetadata {
  target: Function;
  propertyKey: string;
  options: PropOptions;
}
