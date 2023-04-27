import { Inject } from '@nestjs/common';
import { getConnectionToken, getModelToken } from './mongoose.utils';

/**
 * @description `@InjectModel()` decorator is specifically used for injecting Mongoose models.
 *
 * Injection tokens can be types (class names), strings, or symbols, depending on how
 * the provider with which it is associated was defined. Providers defined with the
 * `@Injectable()` decorator use the class name, while custom providers may use
 * strings or symbols as the injection token.
 *
 * @param model The name of the Mongoose model that needs to be injected.
 * @param connectionName The name of the database connection where the model is defined.
 * If not specified, the default connection will be used.
 * @returns void
 */
export const InjectModel = (model: string, connectionName?: string) =>
  Inject(getModelToken(model, connectionName));

export const InjectConnection = (name?: string) =>
  Inject(getConnectionToken(name));
