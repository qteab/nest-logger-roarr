import { Controller, Get, Logger } from "@nestjs/common";
import { RequestIdModule, RequestIdService } from "@qte/nest-request-id";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { RoarrLoggerModule, RoarrLoggerService } from "~/roarr-logger";

@Controller()
class TestController {
  private readonly logger = new Logger(TestController.name);
  @Get("/")
  public async get() {
    // throw new Error("hihi");
    const err = new Error("hihi");
    this.logger.error(err);
    return { hihi: "hoho" };
  }
}

describe("Middleware", () => {
  let client: () => request.SuperTest<request.Test>;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        RequestIdModule.forRoot(),
        RoarrLoggerModule.forRootAsync({
          inject: [RequestIdService],
          useFactory: (requestIdService: RequestIdService) => ({
            assignOnRequest: () => ({
              requestId: requestIdService.get(),
            }),
          }),
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
    console.log(response.body);
  });
});
