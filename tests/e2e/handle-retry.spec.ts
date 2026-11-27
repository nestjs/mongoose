import { Logger } from '@nestjs/common';
import { defer, lastValueFrom, of, throwError } from 'rxjs';
import { handleRetry } from '../../lib/common/mongoose.utils.js';

describe('handleRetry', () => {
  let attempts: number;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  const failingConnection = defer(() => {
    attempts++;
    return throwError(() => new Error(`attempt ${attempts} failed`));
  });

  beforeEach(() => {
    attempts = 0;
    errorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not announce a retry after the last attempt', async () => {
    await expect(
      lastValueFrom(failingConnection.pipe(handleRetry(2, 0))),
    ).rejects.toThrow('attempt 2 failed');
    expect(attempts).toBe(2);
    const messages = errorSpy.mock.calls.map(([message]) => message);
    expect(messages).toEqual([
      'Unable to connect to the database. Retrying (1)...',
      'Unable to connect to the database.',
    ]);
  });

  describe('when a limit is not a number', () => {
    // Connects on the 21st attempt, so that a retry that never gives up
    // resolves instead of hanging the test
    const connectionUpAfter20Attempts = defer(() => {
      attempts++;
      return attempts > 20
        ? of('connected')
        : throwError(() => new Error(`attempt ${attempts} failed`));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('makes 9 connection attempts when retryAttempts is NaN', async () => {
      // e.g. `Number(process.env.MONGO_RETRY_ATTEMPTS)` when it is not set
      await expect(
        lastValueFrom(
          connectionUpAfter20Attempts.pipe(handleRetry(Number.NaN, 0)),
        ),
      ).rejects.toThrow('attempt 9 failed');
      expect(attempts).toBe(9);
    });

    it('waits 3000ms between attempts when retryDelay is NaN', async () => {
      vi.useFakeTimers();
      const connection = lastValueFrom(
        failingConnection.pipe(handleRetry(2, Number.NaN)),
      ).catch((err: Error) => err);

      await vi.advanceTimersByTimeAsync(2999);
      expect(attempts).toBe(1);
      await vi.advanceTimersByTimeAsync(1);
      expect(attempts).toBe(2);
      expect(await connection).toEqual(new Error('attempt 2 failed'));
    });

    it('keeps retrying until the connection succeeds when retryAttempts is Infinity', async () => {
      await expect(
        lastValueFrom(
          connectionUpAfter20Attempts.pipe(handleRetry(Infinity, 0)),
        ),
      ).resolves.toBe('connected');
      expect(attempts).toBe(21);
    });
  });
});
