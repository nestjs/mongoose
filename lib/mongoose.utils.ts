import * as mongoose from 'mongoose';

export function getModelToken(model: mongoose.Schema) {
  console.log(JSON.stringify(model));
  return `${JSON.stringify(model)}Model`;
}