export interface MongooseModuleOptions {
  [key: string]: any;
  retryAttempts?: number;
  retryDelay?: number;
  connectionName?: string;
}
