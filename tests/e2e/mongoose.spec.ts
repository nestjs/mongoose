import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

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

  it(`should return created document`, (done) => {
    const createDto = { name: 'Nest', breed: 'Maine coon', age: 5 };
    request(server)
      .post('/cats')
      .send(createDto)
      .expect(201)
      .end((err, { body }) => {
        expect(body.name).toEqual(createDto.name);
        expect(body.age).toEqual(createDto.age);
        expect(body.breed).toEqual(createDto.breed);
        done();
      });
  });

  it(`should return created document with dynamic connections`, (done) => {
    const createDto = { name: 'Khalice', breed: 'Vira-Lata Caramelo', age: 5 };
    request(server)
      .post('/dogs')
      .set('origin', 'dogs.com')
      .send(createDto)
      .expect(201)
      .end((err, { body }) => {
        expect(body.name).toEqual(createDto.name);
        expect(body.age).toEqual(createDto.age);
        expect(body.breed).toEqual(createDto.breed);
        done();
      });
  });

  it(`should return created document in correct database`, async () => {
    // Create a document on Database mapped to origin dogs.com
    const createDto = { name: 'Baleia', breed: 'Vira-Lata', age: 5 };
    const dogsDotCom = await request(server)
      .post('/dogs')
      .set('origin', 'dogs.com')
      .send(createDto);

    expect(dogsDotCom.statusCode).toBe(201);
    expect(dogsDotCom.body.name).toBe(createDto.name);
    expect(dogsDotCom.body.age).toBe(createDto.age);
    expect(dogsDotCom.body.breed).toBe(createDto.breed);

    // List documents from Database mapped to origin dogs.com
    const findAllDogsDotCom = await request(server)
      .get('/dogs')
      .set('origin', 'dogs.com');

    const baleia = findAllDogsDotCom.body.find((dog) => dog.name === 'Baleia');

    expect(findAllDogsDotCom.statusCode).toBe(200);
    expect(baleia.name).toBe(createDto.name);
    expect(baleia.age).toBe(createDto.age);
    expect(baleia.breed).toBe(createDto.breed);

    // List documents from Database mapped as fallback (no dogs here because is another database)
    const findAllAnotherDB = await request(server).get('/dogs');
    expect(findAllAnotherDB.statusCode).toBe(200);
    expect(Array.isArray(findAllAnotherDB.body)).toBe(true);
    expect(findAllAnotherDB.body.length).toBe(0);
  });

  afterEach(async () => {
    await app.close();
  });
});
