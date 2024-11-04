import { describe, it, expect } from '@jest/globals';

import ConfigController from "../../src/controller/config-controller";
import ConfigService from "../../src/service/config-service";

describe('ConfigService', () => {
    it('it should return the first config register', async () => {
        const configService = new ConfigService();
        const configController = new ConfigController(configService);

        const config = await configController.listFirst();

        console.log(config);

        expect(config).toBeTruthy();
        expect(config?.id).toBeTruthy();
        expect(config?.id).toBeDefined();
    });
});

// import { describe, beforeEach, it, expect, jest } from "@jest/globals";
// import { configs, PrismaClient } from "@prisma/client";

// import ConfigService from "../../src/service/config-service";
// import db from "../../src/lib/db";

// jest.mock('../../src/lib/db');

// const prismaMock = db as jest.Mocked<PrismaClient>

// describe('ConfigService', () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//     });

//     it('should create a config', async () => {
//         const data: configs = {
//             id: 2,
//             idInputUsuario: '',
//             idInputSenha: '',
//             idBotaoLogin: '',
//             idBotaoLance: '',
//             usuario: '',
//             senha: '',
//             urlLogin: '',
//             urlDisputa: '',
//             tituloDisputa: '',
//             valorMinimo: '',
//             idInputLance: '',
//             lanceInicial: '',
//             redutor: '',
//             auto: 0,
//             horaFinal: '',
//             redutorAuto: '',
//             apiKey: '',
//             siteKey: '',
//             horaInicialAuto: '',
//             horaFinalAuto: '',
//             apiPostLance: '',
//             hostName: '',
//             ultimaAtualizacao: '',
//             proximaAtualizacao: '',
//             nuSequencial: '',
//             leituraUnica: 0,
//             horaInicio: '',
//         }

//         prismaMock.configs.create.mockResolvedValue(data);
//         // prismaMock.configs.create.mockResolvedValue({} as any);

//         const configService = new ConfigService();
//         const config = await configService.create({} as any);

//         expect(config).toBeTruthy();
//         expect(config?.id).toBeTruthy();
//         expect(config?.id).toBeDefined();
//     });

//     // it('should list all configs', async () => {
//     //     prismaMock.configs.


//     //     const configService = new ConfigService();
//     //     const configs = await configService.listAll();

//     //     expect(configs).toBeTruthy();
//     //     expect(configs?.length).toBeGreaterThan(0);
//     // });
// })