export class CannotDetermineTypeError extends Error {
  constructor(hostClass: string, propertyKey: string) {
    super(
      `Cannot determine a type for the "${hostClass}.${propertyKey}" field (union/intersection/ambiguous type was used). Make sure your property is decorated with a "@Prop({ type: TYPE_HERE })" decorator.`,
    );
  }
}
