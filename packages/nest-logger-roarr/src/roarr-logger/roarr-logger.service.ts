import {
  Inject,
  Injectable,
  LogLevel,
  LoggerService as NestLoggerService,
} from "@nestjs/common";
import { Roarr } from "roarr";
import { serializeError } from "serialize-error";
import { JsonObject, ModuleOptions } from "./types";
import { Store } from "./roarr-logger.store";
import { isErrorLike } from "./utility";

@Injectable()
export class RoarrLoggerService implements NestLoggerService {
  constructor();
  constructor(context?: string);
  constructor(context?: string, options?: ModuleOptions);
  constructor(
    private readonly context?: string,
    private readonly options?: ModuleOptions
  ) {}

  public assign(value: JsonObject) {
    const store = Store.getStore();
    if (!store) {
      throw new Error("Cannot assign to logger out of request scope");
    }
    store.logger = store.logger.child(value);
  }

  public debug(message: any, context?: string): void;
  public debug(message: any, ...optionalParams: [...any, string?]): void;
  public debug(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);
    this.printMessages("debug", messages, context);
  }

  public error(message: any, stackOrContext?: string): void;
  public error(message: any, stack?: string, context?: string): void;
  public error(
    message: any,
    ...optionalParams: [...any, string?, string?]
  ): void;
  public error(message: any, ...optionalParams: any[]) {
    // For the case when someone calls logger.error(new Error())
    // input will be Error, undefined, context
    if (isErrorLike(message)) {
      const serializedError = serializeError(message);
      const lastElement = optionalParams[optionalParams.length - 1];
      const isContext = typeof lastElement === "string";
      this.logger.error(
        {
          namespace: lastElement && isContext ? lastElement : this.context,
          error: serializeError(message),
        },
        serializedError.message || "Error"
      );
      return;
    }
    const { messages, context, stack } =
      this.getContextAndStackAndMessagesToPrint([message, ...optionalParams]);
    messages.forEach((message) => {
      const logMessage =
        typeof message === "string" ? message : JSON.stringify(message);
      this.logger.error(
        {
          namespace: context,
          error: {
            message: logMessage,
            stack,
          },
        },
        logMessage
      );
      // this.logger.error(
      //   {
      //     namespace: context,
      //     error: {
      //       message,
      //       stack,
      //     },
      //   },
      //   message
      // );
    });
  }

  public log(message: any, context?: string): void;
  public log(message: any, ...optionalParams: [...any, string?]): void;
  public log(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);
    this.printMessages("info", messages, context);
  }

  public verbose(message: any, context?: string): void;
  public verbose(message: any, ...optionalParams: [...any, string?]): void;
  public verbose(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);
    this.printMessages("trace", messages, context);
  }

  public warn(message: any, context?: string): void;
  public warn(message: any, ...optionalParams: [...any, string?]): void;
  public warn(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);
    this.printMessages("warn", messages, context);
  }

  public get logger() {
    return Store.getStore()?.logger || Roarr;
  }
  // private doLog(
  //   level: "debug" | "error" | "info" | "trace" | "warn",
  //   message: any,
  //   context?: string
  // ): void;
  // private doLog(
  //   level: "debug" | "error" | "info" | "trace" | "warn",
  //   message: any,
  //   ...optionalParams: [...any, string?]
  // ): void;
  // private doLog(
  //   level: "debug" | "error" | "info" | "trace" | "warn",
  //   message: any,
  //   ...optionalParams: any[]
  // ) {
  //   // Nest
  //   // if (args.length === 1 && args[0] !== 'string') {
  //   //   args[0] = JSON.stringify
  //   // }
  //   console.log({
  //     level,
  //     message,
  //     optionalParams,
  //   });
  //   // this.logger[level](...args);
  //   // this.logger[level]("hihihi");
  // }

  private printMessages(
    level: "debug" | "info" | "trace" | "warn",
    messages: unknown[],
    context?: string
  ) {
    messages.forEach((message) =>
      this.logger[level](
        {
          namespace: context,
        },
        typeof message === "string" ? message : JSON.stringify(message)
      )
    );
  }

  private getContextAndMessagesToPrint(args: unknown[]) {
    if (args?.length <= 1) {
      return { messages: args, context: this.context };
    }
    const lastElement = args[args.length - 1];
    const isContext = typeof lastElement === "string";
    if (!isContext) {
      return { messages: args, context: this.context };
    }
    return {
      context: lastElement as string,
      messages: args.slice(0, args.length - 1),
    };
  }

  private getContextAndStackAndMessagesToPrint(args: unknown[]) {
    if (args.length === 2) {
      return this.isStackFormat(args[1])
        ? {
            messages: [args[0]],
            stack: args[1] as string,
            context: this.context,
          }
        : {
            messages: [args[0]],
            context: args[1] as string,
          };
    }

    const { messages, context } = this.getContextAndMessagesToPrint(args);
    if (messages?.length <= 1) {
      return { messages, context };
    }
    const lastElement = messages[messages.length - 1];
    const isStack = typeof lastElement === "string";
    // https://github.com/nestjs/nest/issues/11074#issuecomment-1421680060
    if (!isStack && lastElement !== undefined) {
      return { messages, context };
    }
    return {
      stack: lastElement as string,
      messages: messages.slice(0, messages.length - 1),
      context,
    };
  }

  private isStackFormat(stack: unknown) {
    if (typeof stack !== "string" || stack !== undefined) {
      return false;
    }

    return /^(.)+\n\s+at .+:\d+:\d+$/.test(stack);
  }
}
