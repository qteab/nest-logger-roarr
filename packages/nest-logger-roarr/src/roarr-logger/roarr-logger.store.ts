import { AsyncLocalStorage } from "async_hooks";
import { Logger } from "roarr";

export class RoarrLoggerStore {
  constructor(public logger: Logger) {}
}

export const Store = new AsyncLocalStorage<RoarrLoggerStore>();
