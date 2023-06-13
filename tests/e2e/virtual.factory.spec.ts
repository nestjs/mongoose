import * as mongoose from 'mongoose';
import { TypeMetadataStorage } from '../../lib/storages/type-metadata.storage';
import { VirtualMetadataInterface } from '../../lib/metadata/virtual-metadata.interface';
import { VirtualsFactory } from '../../lib';

describe('VirtualsFactory', () => {
  // Mock schema & model

  const setVirtualSetterFunctionMock = jest.fn();
  const setVirtualGetterFunctionMock = jest.fn();
  const schemaMock = {
    virtual: jest.fn(() => ({
      get: setVirtualGetterFunctionMock,
      set: setVirtualSetterFunctionMock,
    })),
  } as any;

  const targetConstructorMock = jest.fn();

  // Mock virtuals

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
    (schemaMock.virtual as any) = jest.fn(() => ({
      get: setVirtualGetterFunctionMock,
      set: setVirtualSetterFunctionMock,
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Schema virtual definition', () => {
    it('should not define virtuals if there is no stored virtual definition', () => {
      // arrange
      TypeMetadataStorage['virtuals'] = [];

      // Act
      VirtualsFactory.createForClass(targetConstructorMock, schemaMock);

      // Assert
      expect(schemaMock.virtual).toHaveBeenCalledTimes(0);
    });

    it('should not define virtuals if there is no stored virtual definition linked to schema model', () => {
      // arrange
      TypeMetadataStorage['virtuals'] = [virtualMetadataNotLikedToModelMock];

      // Act
      VirtualsFactory.createForClass(targetConstructorMock, schemaMock);

      // Assert
      expect(schemaMock.virtual).toHaveBeenCalledTimes(0);
    });

    it('should defines virtual for each stored virtualMetadata linked to schema model', () => {
      // arrange
      TypeMetadataStorage['virtuals'] = [
        virtualMetadataWithOnlyRequiredAttributesMock,
        virtualMetadataNotLikedToModelMock,
        virtualMetadataWithOptionsMock,
      ];

      // Act
      VirtualsFactory.createForClass(targetConstructorMock, schemaMock);

      // Assert
      expect(schemaMock.virtual['mock'].calls).toEqual([
        [virtualMetadataWithOnlyRequiredAttributesMock.name, undefined],
        [
          virtualMetadataWithOptionsMock.name,
          virtualMetadataWithOptionsMock.options,
        ],
      ]);
    });
  });

  describe('Schema virtual getter/setter definition', () => {
    it('should not call the getter/setter definition method if no getter/setter defined in the stored virtual metadata linked to the schema model', () => {
      // arrange
      TypeMetadataStorage['virtuals'] = [
        virtualMetadataWithOptionsMock,
      ] as VirtualMetadataInterface[];

      // Act
      VirtualsFactory.createForClass(targetConstructorMock, schemaMock);

      // Assert
      expect(setVirtualGetterFunctionMock).toHaveBeenCalledTimes(0);
      expect(setVirtualSetterFunctionMock).toHaveBeenCalledTimes(0);
    });

    it('should call the getter/setter definition method for each stored virtuals metadata with defined getter/setter linked to the schema model', () => {
      // arrange
      TypeMetadataStorage['virtuals'] = [
        virtualMetadataWithOptionsMock,
        virtualMetadataWithGetterMock,
        virtualMetadataWithSetterMock,
        virtualMetadataWithGetterSetterMock,
      ] as VirtualMetadataInterface[];

      // Act
      VirtualsFactory.createForClass(targetConstructorMock, schemaMock);

      // Assert
      // expect(setVirtualGetterFunctionMock).toHaveBeenNthCalledWith(1,)
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
