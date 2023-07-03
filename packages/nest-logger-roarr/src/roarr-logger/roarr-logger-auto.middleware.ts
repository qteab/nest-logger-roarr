import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { RoarrLoggerService } from "./roarr-logger.service";
import { RoarrLoggerStore, Store } from "./roarr-logger.store";
import { serializeError } from "serialize-error";

const onResponseFinished = (
  logger: RoarrLoggerService,
  request: Request,
  response: Response,
  err: any,
  responseBody: any
) => {
  // const responseTime = Date.now() - res[startTime]
  // const req = res[reqObject]
  // const level = getLogLevelFromCustomLogLevel(customLogLevel, useLevel, res, err, req)

  // if (level === 'silent') {
  //   return
  // }

  // const customPropBindings = (typeof customProps === 'function') ? customProps(req, res) : customProps
  // if (customPropBindings) {
  //   log = logger.child(customPropBindings)
  // }

  if (err || response.statusCode >= 500) {
    const error =
      err ||
      new Error("Request failed with status code " + response.statusCode);

    logger.logger.error(
      {
        error: serializeError(error),
        request: {
          originalUrl: request.originalUrl,
          headers: request.headers,
          body: request.body,
        },
        response: {
          statusCode: response.statusCode,
          body: responseBody,
        },
      },
      `Request failed with status code ${response.statusCode}`
    );

    return;
  }

  logger.logger.info(
    {
      request: {
        originalUrl: request.originalUrl,
        headers: request.headers,
        body: request.body,
      },
      response: {
        statusCode: response.statusCode,
        body: responseBody,
      },
    },
    `Request ${
      /* response.writableEnded ? "aborted" : "completed" */ "completed"
    } with status code ${response.statusCode}`
  );
};

@Injectable()
export class RoarrLoggerAutoMiddleware implements NestMiddleware {
  constructor(private readonly logger: RoarrLoggerService) {}

  use(request: Request, response: Response, next: NextFunction) {
    Store.run(new RoarrLoggerStore(this.logger.logger), () => {
      let autoLogging = true;
      let shouldLogSuccess = true;
      const logResponse = true;

      // const log = quietReqLogger ? logger.child({ [requestIdKey]: req.id }) : logger

      // TODO
      // Put this as an option disabled by default
      // as it is bad
      let responseContent: any;
      if (logResponse) {
        const oldSend = response.send;
        response.send = (content) => {
          responseContent = content;
          response.send = oldSend;
          return response.send(content);
        };
      }

      const onResponseComplete = (error: any) => {
        response.removeListener("close", onResponseComplete);
        response.removeListener("finish", onResponseComplete);
        response.removeListener("error", onResponseComplete);
        return onResponseFinished(
          this.logger,
          request,
          response,
          error,
          responseContent
        );
      };

      if (autoLogging) {
        // if (autoLoggingIgnore !== null && shouldLogSuccess === true) {
        //   const isIgnored = autoLoggingIgnore(req)
        //   shouldLogSuccess = !isIgnored
        // }

        if (shouldLogSuccess) {
          // const shouldLogReceived = receivedMessage !== undefined || onRequestReceivedObject !== undefined
          const shouldLogReceived = true;
          if (shouldLogReceived) {
            // const level = getLogLevelFromCustomLogLevel(customLogLevel, useLevel, res, undefined, req)
            // const receivedObjectResult = onRequestReceivedObject !== undefined ? onRequestReceivedObject(req, res, undefined) : {}
            // const receivedStringResult = receivedMessage !== undefined ? receivedMessage(req, res) : undefined
            // this.logger.logger.info({
            //   request:
            // })
            // requestLogger[level](receivedObjectResult, receivedStringResult)
          }

          response.on("close", onResponseComplete);
          response.on("finish", onResponseComplete);
        }

        response.on("error", onResponseComplete);
      }
      next();
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
    });
  }
}
