import { Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { delay, retryWhen, scan } from 'rxjs/operators';
import { DEFAULT_DB_CONNECTION } from '../mongoose.constants.js';

/**
 * @publicApi
 */
export function getModelToken(model: string, connectionName?: string) {
  if (connectionName === undefined) {
    return `${model}Model`;
  }
  return `${getConnectionToken(connectionName)}/${model}Model`;
}

/**
 * @publicApi
 */
export function getConnectionToken(name?: string) {
  return name && name !== DEFAULT_DB_CONNECTION
    ? `${name}Connection`
    : DEFAULT_DB_CONNECTION;
}

export function getWaitForModelInitToken(connectionName?: string) {
  return `${getConnectionToken(connectionName)}/WaitForModelInit`;
}

const DEFAULT_RETRY_ATTEMPTS = 9;
const DEFAULT_RETRY_DELAY = 3000;

export function handleRetry(
  retryAttempts = DEFAULT_RETRY_ATTEMPTS,
  retryDelay = DEFAULT_RETRY_DELAY,
  verboseRetryLog = false,
): <T>(source: Observable<T>) => Observable<T> {
  // A limit that is not a number, such as the NaN that `Number()` makes of an
  // unset environment variable, gets its default: no comparison is true for
  // NaN, so the attempts would never run out, and a delay of NaN doesn't wait
  // at all. Infinity still retries forever.
  if (isNaN(retryAttempts)) {
    retryAttempts = DEFAULT_RETRY_ATTEMPTS;
  }
  if (isNaN(retryDelay)) {
    retryDelay = DEFAULT_RETRY_DELAY;
  }
  const logger = new Logger('MongooseModule');
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen((e) =>
        e.pipe(
          scan((errorCount, error) => {
            const verboseMessage = verboseRetryLog
              ? ` Message: ${error.message}.`
              : '';
            const isLastAttempt = errorCount + 1 >= retryAttempts;
            const retryMessage = isLastAttempt
              ? ''
              : ` Retrying (${errorCount + 1})...`;

            logger.error(
              [
                'Unable to connect to the database.',
                verboseMessage,
                retryMessage,
              ].join(''),
              error.stack,
            );
            if (isLastAttempt) {
              throw error;
            }
            return errorCount + 1;
          }, 0),
          delay(retryDelay),
        ),
      ),
    );
}
