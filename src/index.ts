import ConfigController from "./controller/config-controller";
import MenuController from "./controller/menu-controller";
import ConfigService from "./service/config-service";

const configService = new ConfigService();

const configController = new ConfigController(configService);
const menuController = new MenuController(configController);

menuController.promptUser();
