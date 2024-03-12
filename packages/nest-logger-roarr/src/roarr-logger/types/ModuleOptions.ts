import {
  MiddlewareConfigProxy,
  ModuleMetadata,
} from "@nestjs/common/interfaces";
import { JsonObject } from "./JsonObject";
import type { Request } from "express";

export interface ModuleOptions {
  autoLog?: {
    exclude?: Parameters<MiddlewareConfigProxy["exclude"]>;
    forRoutes?: Parameters<MiddlewareConfigProxy["forRoutes"]>;
  };
  globalContext?: {
    application?: string;
  };
  assignOnRequest?: (request: Request) => JsonObject;
  assignOnLog?: (data: {level: "debug" | "info" | "trace" | "warn" | "error"}) => any
}
