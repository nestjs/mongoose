import * as mongoose from 'mongoose';

export function getModelToken(model: string) {
  return `${model}Model`;
}