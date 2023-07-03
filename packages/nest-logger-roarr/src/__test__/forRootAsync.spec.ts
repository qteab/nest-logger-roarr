import { Test } from "@nestjs/testing";
import { RoarrLoggerModule, RoarrLoggerService } from "~/roarr-logger";

describe("LoggerModule.forRootAsync", () => {
  it("initializes correctly", async () => {
    const module = await Test.createTestingModule({
      imports: [
        RoarrLoggerModule.forRootAsync({
          useFactory: () => ({}),
        }),
      ],
      controllers: [],
      providers: [],
    }).compile();

    const app = module.createNestApplication();
    app.useLogger(app.get(RoarrLoggerService));
    await app.init();

    expect(app).toBeDefined();
  });
});
