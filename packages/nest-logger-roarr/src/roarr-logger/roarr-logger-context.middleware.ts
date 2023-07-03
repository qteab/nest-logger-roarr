import { Inject, Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { RoarrLoggerService } from "./roarr-logger.service";
import { RoarrLoggerStore, Store } from "./roarr-logger.store";
import { MODULE_OPTIONS_KEY } from "./roarr-logger.constants";
import { ModuleOptions } from "./types";

@Injectable()
export class RoarrLoggerContextMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: RoarrLoggerService,
    @Inject(MODULE_OPTIONS_KEY) private readonly options: ModuleOptions
  ) {}

  use(request: Request, response: Response, next: NextFunction) {
    Store.run(new RoarrLoggerStore(this.logger.logger), () => {
      if (this.options.assignOnRequest) {
        this.logger.assign({
          ...this.options.globalContext,
          ...this.options.assignOnRequest(request),
        });
      }
      next();
    });
  }
}
