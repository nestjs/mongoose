"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const mongoose_utils_1 = require("./mongoose.utils");
exports.InjectModel = model =>
  common_1.Inject(mongoose_utils_1.getModelToken(model));
