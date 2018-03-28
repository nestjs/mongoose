import { Observable } from "rxjs/Observable";
export declare function getModelToken(model: string): string;
export declare function handleRetry<T>(source: Observable<T>): Observable<T>;
