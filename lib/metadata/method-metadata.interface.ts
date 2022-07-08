export interface MethodMetadata {
  target: Function;
  propertyKey: string;
  descriptor: TypedPropertyDescriptor<(...args: any[]) => any>;
}
