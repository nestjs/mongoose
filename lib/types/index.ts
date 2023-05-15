import { Document, RefType, Require_id, Types } from 'mongoose';

export type AllowedRefTypes =
  | typeof String
  | typeof Number
  | typeof Buffer
  | typeof Types.ObjectId
  | typeof Types.Buffer;

export type DocumentType<T, QueryHelpers = any> = Document<
  unknown,
  QueryHelpers,
  T
> &
  Require_id<T>;

export type Ref<
  T,
  RawId extends RefType = T extends { _id: RefType }
    ? T['_id']
    : Types.ObjectId,
> = DocumentType<T> | RawId;
