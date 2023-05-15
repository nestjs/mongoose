import { Model, RefType, Types } from 'mongoose';
import { AllowedRefTypes, DocumentType, Ref } from '../types';

export function isDocument<T, S extends RefType>(
  doc: Ref<T, S> | null | undefined,
): doc is DocumentType<T> {
  return doc instanceof Model;
}

export function isDocumentArray<T, S extends RefType>(
  docs: Types.Array<Ref<T, S>> | null | undefined,
): docs is Types.Array<DocumentType<NonNullable<T>>>;

export function isDocumentArray<T, S extends RefType>(
  docs: Ref<T, S>[] | null | undefined,
): docs is DocumentType<NonNullable<T>>[];

export function isDocumentArray(docs: Ref<any, any>[] | null | undefined) {
  return Array.isArray(docs) && docs.every((v) => isDocument(v));
}

export function isRefType<T, S extends RefType>(
  doc: Ref<T, S> | null | undefined,
  refType: AllowedRefTypes,
): doc is NonNullable<S> {
  if (doc == null || isDocument(doc)) {
    return false;
  }

  if (refType === Types.ObjectId) {
    return doc instanceof Types.ObjectId;
  }

  if (refType === String) {
    return typeof doc === 'string';
  }

  if (refType === Number) {
    return typeof doc === 'number';
  }

  if (refType === Buffer || refType === Types.Buffer) {
    return doc instanceof Buffer;
  }

  return false;
}

export function isRefTypeArray<T, S extends RefType>(
  docs: Types.Array<Ref<T, S>> | null | undefined,
  refType: AllowedRefTypes,
): docs is Types.Array<NonNullable<S>>;

export function isRefTypeArray<T, S extends RefType>(
  docs: Ref<T, S>[] | null | undefined,
  refType: AllowedRefTypes,
): docs is NonNullable<S>[];

export function isRefTypeArray(
  docs: Ref<any, any>[] | null | undefined,
  refType: AllowedRefTypes,
): unknown {
  return Array.isArray(docs) && docs.every((v) => isRefType(v, refType));
}
