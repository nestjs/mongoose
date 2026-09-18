import { Schema as MongooseSchema, Model } from 'mongoose';
import { Test } from '@nestjs/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from '../../lib/index.js';

const CONNECTION_NAME = 'wait-for-model-init';

const WidgetSchema = new MongooseSchema({ name: String });

/** Sentinel used to detect whether a promise is still pending. */
const PENDING = Symbol('pending');

/** Resolves to PENDING if `promise` hasn't settled within a macrotask tick. */
async function isPending(promise: Promise<unknown>): Promise<boolean> {
  const result = await Promise.race([
    promise.catch(() => undefined),
    new Promise((resolve) => setTimeout(() => resolve(PENDING), 100)),
  ]);
  return result === PENDING;
}

function createDeferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('waitForModelInit', () => {
  let closeConnection: (() => Promise<void>) | undefined;
  let initSpy: ReturnType<typeof vi.spyOn> | undefined;

  afterEach(async () => {
    await closeConnection?.().catch(() => undefined);
    closeConnection = undefined;
    initSpy?.mockRestore();
    initSpy = undefined;
  });

  it('does not block model resolution when disabled (default)', async () => {
    const deferred = createDeferred();
    initSpy = vi.spyOn(Model, 'init').mockReturnValue(deferred.promise as any);

    const modulePromise = Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/test', {
          connectionName: CONNECTION_NAME,
        }),
        MongooseModule.forFeature(
          [{ name: 'Widget', schema: WidgetSchema }],
          CONNECTION_NAME,
        ),
      ],
    }).compile();

    expect(await isPending(modulePromise)).toBe(false);

    const module = await modulePromise;
    closeConnection = async () =>
      module.get(getConnectionToken(CONNECTION_NAME)).close();
    deferred.resolve();
  });

  it('blocks model resolution until Model#init() resolves when enabled on forRoot', async () => {
    const deferred = createDeferred();
    initSpy = vi.spyOn(Model, 'init').mockReturnValue(deferred.promise as any);

    const modulePromise = Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/test', {
          connectionName: CONNECTION_NAME,
          waitForModelInit: true,
        }),
        MongooseModule.forFeature(
          [{ name: 'Widget', schema: WidgetSchema }],
          CONNECTION_NAME,
        ),
      ],
    }).compile();

    expect(await isPending(modulePromise)).toBe(true);

    deferred.resolve();
    const module = await modulePromise;
    closeConnection = async () =>
      module.get(getConnectionToken(CONNECTION_NAME)).close();

    const model = module.get(getModelToken('Widget', CONNECTION_NAME));
    expect(model).toBeDefined();
  });

  it('propagates a rejected Model#init() when enabled', async () => {
    initSpy = vi
      .spyOn(Model, 'init')
      .mockRejectedValue(new Error('index build failed'));

    await expect(
      Test.createTestingModule({
        imports: [
          MongooseModule.forRoot('mongodb://localhost:27017/test', {
            connectionName: CONNECTION_NAME,
            waitForModelInit: true,
          }),
          MongooseModule.forFeature(
            [{ name: 'Widget', schema: WidgetSchema }],
            CONNECTION_NAME,
          ),
        ],
      }).compile(),
    ).rejects.toThrow('index build failed');
  });

  it('allows a per-model override to opt out of the connection-wide default', async () => {
    const deferred = createDeferred();
    initSpy = vi.spyOn(Model, 'init').mockReturnValue(deferred.promise as any);

    const modulePromise = Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/test', {
          connectionName: CONNECTION_NAME,
          waitForModelInit: true,
        }),
        MongooseModule.forFeature(
          [{ name: 'Widget', schema: WidgetSchema, waitForModelInit: false }],
          CONNECTION_NAME,
        ),
      ],
    }).compile();

    // The per-model override disables the explicit await, so resolution
    // must not depend on the (still-pending) Model#init() call.
    expect(await isPending(modulePromise)).toBe(false);

    const module = await modulePromise;
    closeConnection = async () =>
      module.get(getConnectionToken(CONNECTION_NAME)).close();
    deferred.resolve();
  });

  it('allows a per-model override to opt in when the connection-wide default is disabled', async () => {
    const deferred = createDeferred();
    initSpy = vi.spyOn(Model, 'init').mockReturnValue(deferred.promise as any);

    const modulePromise = Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/test', {
          connectionName: CONNECTION_NAME,
        }),
        MongooseModule.forFeature(
          [{ name: 'Widget', schema: WidgetSchema, waitForModelInit: true }],
          CONNECTION_NAME,
        ),
      ],
    }).compile();

    expect(await isPending(modulePromise)).toBe(true);

    deferred.resolve();
    const module = await modulePromise;
    closeConnection = async () =>
      module.get(getConnectionToken(CONNECTION_NAME)).close();
  });

  it('supports waitForModelInit on forFeatureAsync', async () => {
    const deferred = createDeferred();
    initSpy = vi.spyOn(Model, 'init').mockReturnValue(deferred.promise as any);

    const modulePromise = Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/test', {
          connectionName: CONNECTION_NAME,
        }),
        MongooseModule.forFeatureAsync(
          [
            {
              name: 'Widget',
              useFactory: async () => WidgetSchema,
              waitForModelInit: true,
            },
          ],
          CONNECTION_NAME,
        ),
      ],
    }).compile();

    expect(await isPending(modulePromise)).toBe(true);

    deferred.resolve();
    const module = await modulePromise;
    closeConnection = async () =>
      module.get(getConnectionToken(CONNECTION_NAME)).close();
  });
});
