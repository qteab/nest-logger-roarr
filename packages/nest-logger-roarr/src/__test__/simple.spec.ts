import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { RoarrLoggerModule, RoarrLoggerService } from "~/roarr-logger";

describe("LoggerService used as Nest Logger", () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        RoarrLoggerModule.forRootAsync({
          useFactory: () => ({}),
        }),
      ],
      controllers: [],
      providers: [],
    }).compile();

    const app = module.createNestApplication({
      bufferLogs: true,
    });

    const logger = app.get(RoarrLoggerService);
    app.useLogger(logger);

    await app.init();

    expect(app).toBeDefined();
  });

  it("initializes correctly", async () => {});
});
