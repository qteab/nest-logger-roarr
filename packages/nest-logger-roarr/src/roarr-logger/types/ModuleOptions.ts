import {
  MiddlewareConfigProxy,
  ModuleMetadata,
} from "@nestjs/common/interfaces";
import { JsonObject } from "./JsonObject";
import type { Request } from "express";
import { MessageSerializer } from "roarr";

export interface ModuleOptions {
  autoLog?: {
    exclude?: Parameters<MiddlewareConfigProxy["exclude"]>;
    forRoutes?: Parameters<MiddlewareConfigProxy["forRoutes"]>;
  };
  globalContext?: {
    application?: string;
  };
  assignOnRequest?: (request: Request) => JsonObject;
  serializeMessage?: MessageSerializer;
}
