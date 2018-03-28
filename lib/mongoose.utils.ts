import { Observable } from "rxjs/Observable";
import { retryWhen, scan, delay } from "rxjs/operators";
import { Logger } from "@nestjs/common";

export function getModelToken(model: string) {
  return `${model}Model`;
}

export function handleRetry<T>(source: Observable<T>): Observable<T> {
  return source.pipe(
    retryWhen(e =>
      e.pipe(
        scan((errorCount, error) => {
          Logger.error(
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
        delay(3000)
      )
    )
  );
}
