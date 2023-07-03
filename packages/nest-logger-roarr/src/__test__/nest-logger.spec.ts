import { Controller, Get, Logger } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { RoarrLoggerModule, RoarrLoggerService } from "~/roarr-logger";

@Controller()
class TestController {
  private readonly logger = new Logger(TestController.name);
  constructor() {}
  @Get("/")
  public async get() {
    // Error without message
    // throw new Error();
    // Error with message
    // throw new Error("some error");
    this.logger.log("hihi");
    return { hihi: "hoho" };
  }
}

describe("Middleware", () => {
  let client: () => request.SuperTest<request.Test>;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        RoarrLoggerModule.forRootAsync({
          useFactory: () => ({}),
        }),
      ],
      controllers: [TestController],
      providers: [],
    }).compile();

    const app = module.createNestApplication({
      bufferLogs: true,
    });

    const logger = app.get(RoarrLoggerService);
    app.useLogger(logger);

    await app.init();
    client = () => request(app.getHttpServer());
  });

  it("logs request", async () => {
    const response = await client().get("/");
  });
});
