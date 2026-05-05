import { RAW_OBJECT_DEFINITION } from '../mongoose.constants.js';

export function raw(definition: Record<string, any>) {
  Object.defineProperty(definition, RAW_OBJECT_DEFINITION, {
    value: true,
    enumerable: false,
    configurable: false,
  });
  return definition;
}
