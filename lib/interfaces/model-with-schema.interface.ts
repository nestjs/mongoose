import { HydratedDocument, Model, Schema } from 'mongoose';

/**
 * Drop-in replacement for `Model<T>` that keeps the `schema` property typed
 * as `Schema<T>`. Since mongoose@9, `Model.schema` resolves to `any` unless
 * the `TSchema` generic is supplied explicitly.
 *
 * @see https://github.com/nestjs/mongoose/issues/2852
 *
 * @publicApi
 */
export type ModelWithSchema<
  TRawDocType,
  TQueryHelpers = {},
  TInstanceMethods = {},
  TVirtuals = {},
> = Model<
  TRawDocType,
  TQueryHelpers,
  TInstanceMethods,
  TVirtuals,
  HydratedDocument<TRawDocType, TVirtuals & TInstanceMethods, TQueryHelpers>,
  Schema<TRawDocType>
>;
