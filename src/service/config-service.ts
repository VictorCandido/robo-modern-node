import { configs } from "@prisma/client";
import db from "../lib/db";

export default class ConfigService {
    constructor() { }

    async create(data: configs) {
        try {
            const newConfig = await db.configs.create({ data });
            return newConfig;
        } catch (error) {
            console.error('[ERROR - 1] - ConfigService - create - ####', error);
            throw error;
        }
    }

    async listAll() {
        try {
            const configs = await db.configs.findMany();
            return configs;
        } catch (error) {
            console.error('[ERROR - 1] - ConfigService - listAll - ####', error);
            throw error;
        }
    }

    async listFirst() {
        try {
            const config = await db.configs.findFirst();
            return config;
        } catch (error) {
            console.error('[ERROR - 1] - ConfigService - listFirst - ####', error);
            throw error;
        }
    }

    async findById(id: number) {
        try {
            const config = await db.configs.findUnique({ where: { id } });
            return config;
        } catch (error) {
            console.error('[ERROR - 1] - ConfigService - findById - ####', error);
            throw error;
        }
    }

    async listTitles() {
        try {
            const titles = await db.configs.findMany({ select: { tituloDisputa: true, id: true } });
            return titles;
        } catch (error) {
            console.error('[ERROR - 1] - ConfigService - listTitles - ####', error);
            throw error;
        }
    }
}