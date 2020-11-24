import { DynamicModule, HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import * as request from 'supertest';
import { MongooseModule } from '../../lib';
import { EventModule } from '../src/event/event.module';
import {
  ClickLinkEvent,
  ClieckLinkEventSchema,
} from '../src/event/schemas/click-link-event.schema';
import { Event, EventSchema } from '../src/event/schemas/event.schema';
import {
  SignUpEvent,
  SignUpEventSchema,
} from '../src/event/schemas/sign-up-event.schema';

const testCase: [string, DynamicModule][] = [
  [
    'forFeature',
    MongooseModule.forFeature([
      {
        name: Event.name,
        schema: EventSchema,
        discriminators: [
          { name: ClickLinkEvent.name, schema: ClieckLinkEventSchema },
          { name: SignUpEvent.name, schema: SignUpEventSchema },
        ],
      },
    ]),
  ],
  [
    'forFeatureAsync',
    MongooseModule.forFeatureAsync([
      {
        name: Event.name,
        useFactory: async () => EventSchema,
        discriminators: [
          { name: ClickLinkEvent.name, schema: ClieckLinkEventSchema },
          { name: SignUpEvent.name, schema: SignUpEventSchema },
        ],
      },
    ]),
  ],
];

describe.each(testCase)('Discriminator - %s', (_, features) => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/test'),
        EventModule.forFeature(features),
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it(`should return click-link document`, async () => {
    const createDto = { url: 'http://google.com' };
    const response = await request(server)
      .post('/event/click-link')
      .send(createDto);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toMatchObject({
      ...createDto,
      kind: expect.any(String),
      time: expect.any(String),
    });
  });

  it(`should return sign-up document`, async () => {
    const createDto = { user: 'testuser' };
    const response = await request(server)
      .post('/event/sign-up')
      .send(createDto);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toMatchObject({
      ...createDto,
      kind: expect.any(String),
      time: expect.any(String),
    });
  });

  test.each`
    path            | payload
    ${'click-link'} | ${{ testing: 1 }}
    ${'sign-up'}    | ${{ testing: 1 }}
  `(`document ($path) should not be created`, async ({ path, payload }) => {
    const response = await request(server).post(`/event/${path}`).send(payload);
    expect(response.error).toBeInstanceOf(Error);
    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
