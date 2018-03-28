"use strict";
var __decorate =
  (this && this.__decorate) ||
  function(decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const mongoose_providers_1 = require("./mongoose.providers");
const mongoose_core_module_1 = require("./mongoose-core.module");
let MongooseModule = (MongooseModule_1 = class MongooseModule {
  static forRoot(uri, options = {}) {
    return {
      module: MongooseModule_1,
      imports: [mongoose_core_module_1.MongooseCoreModule.forRoot(uri, options)]
    };
  }
  static forFeature(models = []) {
    const providers = mongoose_providers_1.createMongooseProviders(models);
    return {
      module: MongooseModule_1,
      providers: providers,
      exports: providers
    };
  }
});
MongooseModule = MongooseModule_1 = __decorate(
  [common_1.Module({})],
  MongooseModule
);
exports.MongooseModule = MongooseModule;
var MongooseModule_1;
