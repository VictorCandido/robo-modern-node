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
        const numCPUs = (os.cpus().length - 1);
        // const numCPUs = 4;

        logger.info({ numCPUs }, '### Iniciando nova instância de NodeBot ###');

        await new Promise(resolve => setTimeout(resolve, 500));
        const selectedConfig = await menuController.promptUser();

        const botController = new BotController(selectedConfig);

        // Inicia a instância do navegador para ficar consultando valor atualizado para o cluster
        const browser = await botController.initBrowser({ headless: false });
        const page = await botController.initPage(browser);
        await botController.login(page);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Consulta valor atualizado para iniciar os lances a partir desse valor
        const bidValue = await botController.consultarValorAtualizado(page);
        botController.initCurrentBidValue(bidValue);
        logger.info({ bidValue }, '#### Valor atualizado consultado');

        // Realiza a consulta dos valores atualizados para permitir que, caso seja feito algum lance
        // grande, o robô consiga atualizar e abaixar a partir desse lance
        botController.initConsultasEmSequencia(page);

        for (let i = 0; i < numCPUs; i++) {
            cluster.fork({ CONFIG: JSON.stringify(selectedConfig) });
        }

        cluster.on('message', (worker, message) => {
            if (message.type === 'requestBid') {
                const newBidValue = botController.getNewBidValue();
                worker.send({
                    type: 'newBidValue',
                    index: message.index,
                    newBidValue
                });
            }
        });

    } else {
        const config = JSON.parse(process.env.CONFIG || '{}') as configs;
        const botController = new BotController(config);
        botController.startBot();
    }
})();