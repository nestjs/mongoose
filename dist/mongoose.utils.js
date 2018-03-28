"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("rxjs/operators");
const common_1 = require("@nestjs/common");
function getModelToken(model) {
  return `${model}Model`;
}
exports.getModelToken = getModelToken;
function handleRetry(source) {
  return source.pipe(
    operators_1.retryWhen(e =>
      e.pipe(
        operators_1.scan((errorCount, error) => {
          common_1.Logger.error(
            `Unable to connect to the database. Retrying (${errorCount +
              1})...`,
            "",
            "MongooseModule"
          );
          if (errorCount >= 10) {
            throw error;
          }
          return errorCount + 1;
        }, 0),
        operators_1.delay(3000)
      )
    )
  );
}
exports.handleRetry = handleRetry;
