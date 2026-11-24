import { DynamicModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Connection } from 'mongoose';
import {
  getModelToken,
  MongooseModule,
  MongooseModuleOptions,
  Prop,
  Schema,
  SchemaFactory,
} from '../../lib/index.js';

const uri = 'mongodb://localhost:27017/test';
const collection = 'model_init_products';

@Schema({ collection })
class Product {
  @Prop({ type: String, required: true })
  sku: string;
}

const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ sku: 1 }, { unique: true });

@Schema({ collection, discriminatorKey: 'kind' })
class Item {
  @Prop({ type: String })
  kind: string;
}

const ItemSchema = SchemaFactory.createForClass(Item);

@Schema({})
class Voucher {
  @Prop({ type: String, required: true })
  code: string;
}

const VoucherSchema = SchemaFactory.createForClass(Voucher);
VoucherSchema.index({ code: 1 }, { unique: true });

const products = MongooseModule.forFeature([
  { name: Product.name, schema: ProductSchema },
]);

describe('Model init', () => {
  let seedConnection: Connection;
  let moduleRef: TestingModule | undefined;
  let connections: Connection[];

  const onConnectionCreate = (connection: Connection) => {
    connections.push(connection);
  };

  const compile = async (imports: DynamicModule[]) => {
    moduleRef = await Test.createTestingModule({ imports }).compile();
    return moduleRef;
  };

  const seedDuplicateSkus = () =>
    seedConnection
      .collection(collection)
      .insertMany([{ sku: 'DUP-1' }, { sku: 'DUP-1' }]);

  const seedDuplicateVoucherCodes = () =>
    seedConnection.collection(collection).insertMany([
      { kind: Voucher.name, code: 'DUP-1' },
      { kind: Voucher.name, code: 'DUP-1' },
    ]);

  const indexNames = async () =>
    (await seedConnection.collection(collection).indexes()).map(
      (index) => index.name,
    );

  beforeAll(async () => {
    seedConnection = await mongoose.createConnection(uri).asPromise();
  });

  beforeEach(async () => {
    connections = [];
    moduleRef = undefined;
    await seedConnection.dropCollection(collection).catch(() => undefined);
  });

  afterEach(async () => {
    await moduleRef?.close();
    // A module that failed to compile leaves its connection open
    await Promise.all(connections.map((connection) => connection.close()));
  });

  afterAll(async () => {
    await seedConnection.dropCollection(collection).catch(() => undefined);
    await seedConnection.close();
  });

  describe('by default', () => {
    it('should not wait for an index that cannot be built', async () => {
      await seedDuplicateSkus();

      const app = await compile([
        MongooseModule.forRoot(uri, { onConnectionCreate }),
        products,
      ]);

      expect(app.get(getModelToken(Product.name))).toBeDefined();
      expect(await indexNames()).not.toContain('sku_1');
    });
  });

  describe('with waitForModelInit on the connection', () => {
    const forRoot = (options: MongooseModuleOptions = {}) =>
      MongooseModule.forRoot(uri, {
        waitForModelInit: true,
        onConnectionCreate,
        ...options,
      });

    it('should build the indexes before the model is injected', async () => {
      const app = await compile([forRoot(), products]);

      expect(app.get(getModelToken(Product.name))).toBeDefined();
      expect(await indexNames()).toContain('sku_1');
    });

    it('should fail when an index cannot be built (forFeature)', async () => {
      await seedDuplicateSkus();

      await expect(compile([forRoot(), products])).rejects.toMatchObject({
        code: 11000,
      });
      expect(await indexNames()).not.toContain('sku_1');
    });

    it('should fail when an index cannot be built (forFeatureAsync)', async () => {
      await seedDuplicateSkus();

      await expect(
        compile([
          forRoot(),
          MongooseModule.forFeatureAsync([
            { name: Product.name, useFactory: async () => ProductSchema },
          ]),
        ]),
      ).rejects.toMatchObject({ code: 11000 });
    });

    it('should fail when an index cannot be built (forRootAsync)', async () => {
      await seedDuplicateSkus();

      await expect(
        compile([
          MongooseModule.forRootAsync({
            useFactory: () => ({
              uri,
              waitForModelInit: true,
              onConnectionCreate,
            }),
          }),
          products,
        ]),
      ).rejects.toMatchObject({ code: 11000 });
    });

    it.each([
      [
        'forFeature',
        MongooseModule.forFeature([
          {
            name: Item.name,
            schema: ItemSchema,
            discriminators: [{ name: Voucher.name, schema: VoucherSchema }],
          },
        ]),
      ],
      [
        'forFeatureAsync',
        MongooseModule.forFeatureAsync([
          {
            name: Item.name,
            useFactory: async () => ItemSchema,
            discriminators: [{ name: Voucher.name, schema: VoucherSchema }],
          },
        ]),
      ],
    ])(
      'should fail when a discriminator index cannot be built (%s)',
      async (_, features) => {
        await seedDuplicateVoucherCodes();

        await expect(compile([forRoot(), features])).rejects.toMatchObject({
          code: 11000,
        });
      },
    );

    it('should fail when an index cannot be built on a named connection', async () => {
      await seedDuplicateSkus();

      await expect(
        compile([
          MongooseModule.forRoot(uri, { onConnectionCreate }),
          forRoot({ connectionName: 'secondary' }),
          MongooseModule.forFeature(
            [{ name: Product.name, schema: ProductSchema }],
            'secondary',
          ),
        ]),
      ).rejects.toMatchObject({ code: 11000 });
    });

    it('should start when autoIndex is disabled', async () => {
      await seedDuplicateSkus();

      const app = await compile([forRoot({ autoIndex: false }), products]);

      expect(app.get(getModelToken(Product.name))).toBeDefined();
      expect(await indexNames()).not.toContain('sku_1');
    });

    it('should not wait for a lazy connection to open', async () => {
      const app = await compile([
        MongooseModule.forRoot('mongodb://127.0.0.1:1/test', {
          lazyConnection: true,
          serverSelectionTimeoutMS: 500,
          waitForModelInit: true,
          onConnectionCreate,
        }),
        products,
      ]);

      expect(app.get(getModelToken(Product.name))).toBeDefined();
    }, 5_000);

    it('should start when the model opts out', async () => {
      await seedDuplicateSkus();

      const app = await compile([
        forRoot(),
        MongooseModule.forFeature([
          {
            name: Product.name,
            schema: ProductSchema,
            waitForModelInit: false,
          },
        ]),
      ]);

      expect(app.get(getModelToken(Product.name))).toBeDefined();
    });
  });

  describe('with waitForModelInit on the model', () => {
    it('should fail when an index cannot be built', async () => {
      await seedDuplicateSkus();

      await expect(
        compile([
          MongooseModule.forRoot(uri, { onConnectionCreate }),
          MongooseModule.forFeature([
            {
              name: Product.name,
              schema: ProductSchema,
              waitForModelInit: true,
            },
          ]),
        ]),
      ).rejects.toMatchObject({ code: 11000 });
    });

    it('should apply to the discriminators of the model', async () => {
      await seedDuplicateVoucherCodes();

      await expect(
        compile([
          MongooseModule.forRoot(uri, { onConnectionCreate }),
          MongooseModule.forFeatureAsync([
            {
              name: Item.name,
              useFactory: async () => ItemSchema,
              discriminators: [{ name: Voucher.name, schema: VoucherSchema }],
              waitForModelInit: true,
            },
          ]),
        ]),
      ).rejects.toMatchObject({ code: 11000 });
    });
  });
});
