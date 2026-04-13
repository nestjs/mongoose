import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateCatDto } from '../src/cats/dto/create-cat.dto';
import { Cat } from '../src/cats/schemas/cat.schema';

describe('Mongoose', () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
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

  it('should populate array of kittens', async () => {
    let createDto: CreateCatDto = {
      name: 'Kitten',
      breed: 'Maine coon',
      age: 1,
    };

    const { body: kitten }: { body: Cat } = await request(server)
      .post('/cats')
      .send(createDto)
      .expect(201);
    expect(kitten.name).toEqual(createDto.name);
    expect(kitten.age).toEqual(createDto.age);
    expect(kitten.breed).toEqual(createDto.breed);

    createDto = {
      ...createDto,
      name: 'Nest',
      age: 5,
      kitten: [kitten._id.toString()],
    };

    const { body: parentBody } = await request(server)
      .post('/cats')
      .send(createDto)
      .expect(201);
    expect(parentBody.name).toEqual(createDto.name);
    expect(parentBody.age).toEqual(createDto.age);
    expect(parentBody.breed).toEqual(createDto.breed);
    const parent = parentBody._id as string;

    const { body } = await request(server)
      .get(`/cat/${parent}`)
      .expect(200);
    expect(Array.isArray(body.kitten)).toBe(true);
    expect(body.kitten[0]._id).toBe(kitten._id);
    expect(body.kitten[0].name).toBe(kitten.name);
    expect(body.kitten[0].breed).toBe(kitten.breed);
    expect(body.kitten[0].age).toBe(kitten.age);
  });

  afterEach(async () => {
    await app.close();
  });
});
