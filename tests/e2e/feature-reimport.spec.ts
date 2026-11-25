import { DynamicModule, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Schema } from 'mongoose';
import { getModelToken, MongooseModule } from '../../lib/index.js';

const URI = 'mongodb://localhost:27017/test';

const createEventSchema = () =>
  new Schema({ name: String }, { discriminatorKey: 'kind' });
const ClickSchema = new Schema({ url: String });

describe('Importing the same feature in several modules', () => {
  let moduleRef: TestingModule;

  afterEach(async () => {
    await moduleRef?.close();
  });

  async function compileWithTwoFeatureModules(
    feature: () => DynamicModule,
    modelName: string,
  ) {
    const modelRef = {
      provide: 'MODEL_REF',
      useFactory: (model: Model<any>) => model,
      inject: [getModelToken(modelName)],
    };

    @Module({ imports: [feature()], providers: [modelRef] })
    class FirstFeatureModule {}

    @Module({ imports: [feature()], providers: [modelRef] })
    class SecondFeatureModule {}

    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(URI),
        FirstFeatureModule,
        SecondFeatureModule,
      ],
    }).compile();

    return {
      first: moduleRef.select(FirstFeatureModule).get<Model<any>>('MODEL_REF'),
      second: moduleRef
        .select(SecondFeatureModule)
        .get<Model<any>>('MODEL_REF'),
    };
  }

  it('should reuse the compiled model with "forFeatureAsync"', async () => {
    const { first, second } = await compileWithTwoFeatureModules(
      () =>
        MongooseModule.forFeatureAsync([
          { name: 'Event', useFactory: () => createEventSchema() },
        ]),
      'Event',
    );

    expect(first.modelName).toBe('Event');
    expect(second).toBe(first);
  });

  it('should reuse discriminator models with "forFeature"', async () => {
    const EventSchema = createEventSchema();
    const { first, second } = await compileWithTwoFeatureModules(
      () =>
        MongooseModule.forFeature([
          {
            name: 'Event',
            schema: EventSchema,
            discriminators: [{ name: 'Click', schema: ClickSchema }],
          },
        ]),
      'Click',
    );

    expect(first.baseModelName).toBe('Event');
    expect(second).toBe(first);
  });

  it('should reuse discriminator models with "forFeatureAsync"', async () => {
    const EventSchema = createEventSchema();
    const { first, second } = await compileWithTwoFeatureModules(
      () =>
        MongooseModule.forFeatureAsync([
          {
            name: 'Event',
            useFactory: () => EventSchema,
            discriminators: [{ name: 'Click', schema: ClickSchema }],
          },
        ]),
      'Click',
    );

    expect(first.baseModelName).toBe('Event');
    expect(second).toBe(first);
  });

  it('should still compile a model with a custom "collection" on every import', async () => {
    const { first, second } = await compileWithTwoFeatureModules(
      () =>
        MongooseModule.forFeatureAsync([
          {
            name: 'Event',
            useFactory: () => createEventSchema(),
            collection: 'events',
          },
        ]),
      'Event',
    );

    expect(first.collection.name).toBe('events');
    expect(second.collection.name).toBe('events');
  });

  it('should still register the discriminator again with "overwriteModels"', async () => {
    const EventSchema = new Schema(
      { name: String },
      { discriminatorKey: 'kind', overwriteModels: true },
    );
    const { first, second } = await compileWithTwoFeatureModules(
      () =>
        MongooseModule.forFeature([
          {
            name: 'Event',
            schema: EventSchema,
            discriminators: [{ name: 'Click', schema: ClickSchema }],
          },
        ]),
      'Click',
    );

    expect(first.baseModelName).toBe('Event');
    expect(second.baseModelName).toBe('Event');
  });
});
