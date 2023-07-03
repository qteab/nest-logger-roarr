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
        this.logger.assign(this.options.assignOnRequest(request));
      }
      // TODO investigate whether to follow
      // https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#httprequest
      // this.logger.assign({
      //   httpRequest: {
      //     requestMethod: request.method,
      //     requestUrl: request.url,
      //     // requestSize: request.leng,
      //     status: response.status,
      //     // responseSize: string,
      //     // userAgent: string,
      //     // remoteIp: request.ip,
      //     // serverIp: string,
      //     // referer: string,
      //     // latency: string,
      //     // cacheLookup: boolean,
      //     // cacheHit: boolean,
      //     // cacheValidatedWithOriginServer: boolean,
      //     // cacheFillBytes: string,
      //     // protocol: string,
      //   },
      // });
      // this.logger.logger.log({
      //   requestMethod: request.method,
      // });
      next();
    });
  }
}
