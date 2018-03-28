"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_utils_1 = require("./mongoose.utils");
function createMongooseProviders(models = []) {
  const providers = (models || []).map(model => ({
    provide: mongoose_utils_1.getModelToken(model.name),
    useFactory: connection => connection.model(model.name, model.schema),
    inject: ["DbConnectionToken"]
  }));
  return providers;
}
exports.createMongooseProviders = createMongooseProviders;
