import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';
import { LazyAppModule } from '../src/lazy-app.module.js';

describe('Mongoose lazy connection', () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [LazyAppModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it(`should return created document`, async () => {
    const createDto = { name: 'Nest', breed: 'Maine coon', age: 5 };
    const { body } = await request(server)
      .post('/cats')
      .send(createDto)
      .expect(201);
    expect(body.name).toEqual(createDto.name);
    expect(body.age).toEqual(createDto.age);
    expect(body.breed).toEqual(createDto.breed);
  });

  afterEach(async () => {
    await app.close();
  });
});
