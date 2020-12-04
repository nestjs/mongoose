import { Connection, Types } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, MongooseModule } from '../../../../lib';

import { MongoMemoryServer } from 'mongodb-memory-server';

import { RegionModule } from './region.module';
import { RegionService } from './region.service';

describe('RegionService', () => {
  let mongoServer: MongoMemoryServer;

  let connection: Connection;
  let module: TestingModule;

  let service: RegionService;

  beforeAll(async () => {
    mongoServer = new MongoMemoryServer({ autoStart: true });
    const mongoUri = await mongoServer.getUri();
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri, {
          useNewUrlParser: true,
          useCreateIndex: true,
          useFindAndModify: false,
          useUnifiedTopology: true,
        }),
        RegionModule,
      ],
    }).compile();
    await module.init();
    service = module.get<RegionService>(RegionService);
    connection = module.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await connection.close();
    await mongoServer.stop();
    await module.close();
  });

  afterEach(async () => {
    await connection.dropDatabase();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should create a region', async () => {
    const region = await service.create('Teste');
    expect(region.name).toBeDefined();
  });

  it('should list all created regions', async () => {
    await service.create('Teste1');
    await service.create('Teste2');
    await service.create('Teste3');
    await service.create('Teste4');

    const regions = await service.getAll();
    expect(regions.length).toBe(4);
  });

  it('should get campaign by id', async () => {
    const region = await service.create('Teste');

    await expect(service.getRegion(region._id)).resolves.not.toThrow();

    const found = await service.getRegion(region._id);
    expect(found.name).toBe(region.name);
  });

  it('should add flood event to region', async () => {
    let region = await service.create('Teste');
    expect(region.events.length).toBe(0);

    region = await service.addFloodEventToRegion(region._id, {
      reason: 'Test',
    });

    expect(region.events.length).toBe(1);
    expect(region.events[0].reason).toBe('flood');
  });
});
