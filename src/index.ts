import { configs } from '@prisma/client';
import cluster from 'node:cluster';
import os from 'node:os';

import BotController from './controller/bot-controller';
import ConfigController from "./controller/config-controller";
import MenuController from "./controller/menu-controller";
import logger from "./lib/logger";
import ConfigService from "./service/config-service";

const configService = new ConfigService();

const configController = new ConfigController(configService);
const menuController = new MenuController(configController);

// logger.info('### Iniciando nova instância de NodeBot ###');

// (async () => {
//     await new Promise(resolve => setTimeout(resolve, 500));
//     menuController.promptUser();
// })();


(async () => {
    if (cluster.isPrimary) {
        const numCPUs = os.cpus().length;

        logger.info({ numCPUs }, '### Iniciando nova instância de NodeBot ###');

        await new Promise(resolve => setTimeout(resolve, 500));
        const selectedConfig = await menuController.promptUser();

        for (let i = 0; i < numCPUs; i++) {
            cluster.fork({ CONFIG: JSON.stringify(selectedConfig) });
        }

    } else {
        const config = JSON.parse(process.env.CONFIG || '{}') as configs;
        const botController = new BotController(config);
        botController.startBot();
    }
})();