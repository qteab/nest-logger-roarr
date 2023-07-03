import { DynamicModule, Module } from "@nestjs/common";
import { RoarrLoggerCoreModule } from "./roarr-logger-core.module";
import { ModuleAsyncOptions } from "./types";

@Module({})
export class RoarrLoggerModule {
  public static forRootAsync(options: ModuleAsyncOptions): DynamicModule {
    return {
      module: RoarrLoggerModule,
      imports: [RoarrLoggerCoreModule.forRootAsync(options)],
    };
  }
}
