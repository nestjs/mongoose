import { VirtualsFactory } from '../../lib';
import { VirtualMetadataInterface } from '../../lib/metadata/virtual-metadata.interface';
import { TypeMetadataStorage } from '../../lib/storages/type-metadata.storage';

describe('VirtualsFactory', () => {
  const setVirtualSetterFunctionMock = jest.fn();
  const setVirtualGetterFunctionMock = jest.fn();
  const schemaMock = {
    virtual: jest.fn(() => ({
      get: setVirtualGetterFunctionMock,
      set: setVirtualSetterFunctionMock,
    })),
  } as any;

  const targetConstructorMock = jest.fn();

  const virtualOptionsMock = {
    ref: 'collectionNameMock',
    localField: 'localFieldMockValue',
    foreignField: 'foreignFieldMockValue',
  };

  const virtualMetadataWithOnlyRequiredAttributesMock = {
    target: targetConstructorMock,
    name: 'attribute1Mock',
  };

  const virtualMetadataNotLikedToModelMock = {
    target: jest.fn(),
    name: 'attribute1Mock',
  };

  const virtualMetadataWithOptionsMock = {
    target: targetConstructorMock,
    name: 'virtualMetadataWithOptionsMock',
    options: virtualOptionsMock,
  };

  const virtualMetadataWithGetterMock = {
    target: targetConstructorMock,
    name: 'virtualMetadataWithGetterMock',
    options: virtualOptionsMock,
    getter: jest.fn(),
  };

  const virtualMetadataWithSetterMock = {
    target: targetConstructorMock,
    name: 'virtualMetadataWithSetterMock',
    options: virtualOptionsMock,
    setter: jest.fn(),
  };

  const virtualMetadataWithGetterSetterMock = {
    target: targetConstructorMock,
    name: 'virtualMetadataWithGetterSetterMock',
    options: virtualOptionsMock,
    getter: jest.fn(),
    setter: jest.fn(),
  };

  beforeEach(() => {
    schemaMock.virtual = jest.fn(() => ({
      get: setVirtualGetterFunctionMock,
      set: setVirtualSetterFunctionMock,
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Schema virtual definition', () => {
    it('should not define any virtuals if no virtual definitions are stored', () => {
      TypeMetadataStorage['virtuals'] = [];

      VirtualsFactory.inspect(targetConstructorMock, schemaMock);

      expect(schemaMock.virtual).not.toHaveBeenCalled();
    });

    it('should not define virtuals if there are no stored virtual definitions linked to the schema model', () => {
      TypeMetadataStorage['virtuals'] = [virtualMetadataNotLikedToModelMock];

      VirtualsFactory.inspect(targetConstructorMock, schemaMock);

      expect(schemaMock.virtual).not.toHaveBeenCalled();
    });

    it('should define virtuals for each stored virtual metadata linked to the schema model', () => {
      TypeMetadataStorage['virtuals'] = [
        virtualMetadataWithOnlyRequiredAttributesMock,
        virtualMetadataNotLikedToModelMock,
        virtualMetadataWithOptionsMock,
      ];

      VirtualsFactory.inspect(targetConstructorMock, schemaMock);

      expect(schemaMock.virtual['mock'].calls).toEqual([
        [virtualMetadataWithOnlyRequiredAttributesMock.name, undefined],
        [
          virtualMetadataWithOptionsMock.name,
          virtualMetadataWithOptionsMock.options,
        ],
      ]);
    });
  });

  describe('Schema virtual getter/setter definitions', () => {
    it('should not call the getter/setter methods if no getter/setter is defined in the stored virtual metadata linked to the schema model', () => {
      TypeMetadataStorage['virtuals'] = [
        virtualMetadataWithOptionsMock,
      ] as VirtualMetadataInterface[];

      VirtualsFactory.inspect(targetConstructorMock, schemaMock);

      expect(setVirtualGetterFunctionMock).not.toHaveBeenCalled();
      expect(setVirtualSetterFunctionMock).not.toHaveBeenCalled();
    });

    it('should invoke the getter/setter methods for each stored virtual metadata with defined getter/setter linked to the schema model', () => {
      TypeMetadataStorage['virtuals'] = [
        virtualMetadataWithOptionsMock,
        virtualMetadataWithGetterMock,
        virtualMetadataWithSetterMock,
        virtualMetadataWithGetterSetterMock,
      ] as VirtualMetadataInterface[];

      VirtualsFactory.inspect(targetConstructorMock, schemaMock);

      expect(setVirtualGetterFunctionMock.mock.calls).toEqual([
        [virtualMetadataWithGetterMock.getter],
        [virtualMetadataWithGetterSetterMock.getter],
      ]);
      expect(setVirtualSetterFunctionMock.mock.calls).toEqual([
        [virtualMetadataWithSetterMock.setter],
        [virtualMetadataWithGetterSetterMock.setter],
      ]);
    });
  });
});
