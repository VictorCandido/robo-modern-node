import { configs } from "@prisma/client";
import ConfigService from "../service/config-service";

export default class ConfigController {

    config: configs | undefined;

    constructor(private configService: ConfigService) { }

    async listAll() {
        try {
            const configs = await this.configService.listAll();
            return configs;
        } catch (error) {
            console.error('[ERROR - 2] - ConfigController - listAll - ####', error);
            throw error;
        }
    }

    async listFirst() {
        try {
            const config = await this.configService.listFirst();
            return config;
        } catch (error) {
            console.error('[ERROR - 2] - ConfigController - listFirst - ####', error);
            throw error;
        }
    }

    async listById(id: number) {
        try {
            const config = await this.configService.findById(id);
            return config;
        } catch (error) {
            console.error('[ERROR - 2] - ConfigController - listById - ####', error);
            throw error;
        }
    }

    async listTitles() {
        try {
            const titles = await this.configService.listTitles();
            return titles;
        } catch (error) {
            console.error('[ERROR - 2] - ConfigController - listTitles - ####', error);
            throw error;
        }
    }
}
