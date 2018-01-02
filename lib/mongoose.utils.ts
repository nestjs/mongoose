import * as mongoose from 'mongoose';

export function getModelToken(model: mongoose.Schema) {
  return `${JSON.stringify(model)}Model`;
}