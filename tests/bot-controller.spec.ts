import { describe, expect, it } from "vitest";
import ConfigService from "../src/service/config-service";
import ConfigController from "../src/controller/config-controller";

describe('BotController', () => {
    it('should start and stop the bot', async () => {
        const configService = new ConfigService();
        const configController = new ConfigController(configService);

        const config = await configController.listFirst();

        console.log('config', config);

        expect(config).toBeTruthy();
        expect(config?.id).toBeTruthy();
        expect(config?.id).toBeDefined();
    });

    // it('should return config with id 1', async () => {
    //     const configService = new ConfigService();
    //     const configController = new ConfigController(configService);

    //     const config = await configController.findById(1);

    //     expect(config).toBeTruthy();
    //     expect(config?.id).toBeTruthy();
    //     expect(config?.id).toBeDefined();
    // });
});