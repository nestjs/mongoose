import { Logger } from '@nestjs/common';
import { defer, lastValueFrom, throwError } from 'rxjs';
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
});
