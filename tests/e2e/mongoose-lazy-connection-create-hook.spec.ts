import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { vi } from 'vitest';
import { getConnectionToken, MongooseModule } from '../../lib/index.js';

describe('Mongoose lazy connection with onConnectionCreate', () => {
  let moduleRef: TestingModule;

  afterEach(async () => {
    await moduleRef?.close();
  });

  it('should call onConnectionCreate before the connection opens', async () => {
    const events: string[] = [];
    const onConnectionCreate = vi.fn((connection: Connection) => {
      connection.on('connected', () => events.push('connected'));
    });

    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/test', {
          lazyConnection: true,
          onConnectionCreate,
        }),
      ],
    }).compile();

    const connection = moduleRef.get<Connection>(getConnectionToken());
    expect(onConnectionCreate).toHaveBeenCalledTimes(1);
    expect(onConnectionCreate).toHaveBeenCalledWith(connection);

    await connection.asPromise();
    expect(events).toEqual(['connected']);
  });
});
