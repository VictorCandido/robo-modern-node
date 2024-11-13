import ConfigController from "./controller/config-controller";
import MenuController from "./controller/menu-controller";
import logger from "./lib/logger";
import ConfigService from "./service/config-service";

const configService = new ConfigService();

const configController = new ConfigController(configService);
const menuController = new MenuController(configController);

logger.info('### Iniciando nova instância de NodeBot ###');

(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    menuController.promptUser();
})();
