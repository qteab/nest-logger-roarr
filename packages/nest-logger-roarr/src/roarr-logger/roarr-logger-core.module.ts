import {
  DynamicModule,
  FactoryProvider,
  Global,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { ModuleAsyncOptions, ModuleOptions } from "./types";
import { MODULE_OPTIONS_KEY } from "./roarr-logger.constants";
import { RoarrLoggerService } from "./roarr-logger.service";
import { RoarrLoggerContextMiddleware } from "./roarr-logger-context.middleware";
import { RoarrLoggerAutoMiddleware } from "./roarr-logger-auto.middleware";
import { MessageEventHandler, ROARR } from "roarr";

@Global()
@Module({})
export class RoarrLoggerCoreModule implements NestModule {
  constructor(
    @Inject(MODULE_OPTIONS_KEY) private readonly options: ModuleOptions
  ) {}

  public static forRootAsync(options: ModuleAsyncOptions): DynamicModule {
    const optionsProvider: FactoryProvider = {
      provide: MODULE_OPTIONS_KEY,
      useFactory: options.useFactory,
      inject: options.inject,
    };

    const serviceProvider: FactoryProvider = {
      inject: [MODULE_OPTIONS_KEY],
      provide: RoarrLoggerService,
      useFactory: (options: ModuleOptions) =>
        new RoarrLoggerService(undefined, options),
    };

    return {
      exports: [RoarrLoggerService],
      module: RoarrLoggerCoreModule,
      providers: [optionsProvider, serviceProvider],
    };
  }

  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RoarrLoggerContextMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });

    if (this.options.autoLog?.exclude) {
      consumer
        .apply(RoarrLoggerAutoMiddleware)
        .exclude(...this.options.autoLog.exclude)
        .forRoutes(
          ...(this.options.autoLog.forRoutes || [
            { path: "*", method: RequestMethod.ALL },
          ])
        );
    } else {
      consumer
        .apply(RoarrLoggerAutoMiddleware)
        .forRoutes(
          ...(this.options.autoLog?.forRoutes || [
            { path: "*", method: RequestMethod.ALL },
          ])
        );
    }
  }
}
