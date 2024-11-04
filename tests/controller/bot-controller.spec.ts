test('empty test', () => {})

// // import {  } from '@jest/globals';
// import { test, expect } from '@playwright/test';

// import BotController from '../../src/controller/bot-controller';
// import { configs } from '@prisma/client';

// test('should init page', async () => {
//     const config: configs = {
//         "id": 1,
//         "idInputUsuario": "username",
//         "idInputSenha": "password",
//         "idBotaoLogin": "login",
//         "idBotaoLance": "newBidButton",
//         "usuario": "sistema",
//         "senha": "1!@#SAWOLK",
//         "urlLogin": "https://nodetst.iv2.com.br/sign-in?redirect_url=https%3A%2F%2Fnodetst.iv2.com.br%2F",
//         "urlDisputa": "https://nodetst.iv2.com.br/api/lances-html/377f7f5e-4412-475e-b9bf-5db1fe306c57",
//         "tituloDisputa": "Sem Captcha",
//         "valorMinimo": "200.000,00",
//         "idInputLance": "newBid",
//         "lanceInicial": "",
//         "redutor": "5,00",
//         "auto": 0,
//         "horaFinal": "23/10/2024 00:12:51",
//         "redutorAuto": "2,00",
//         "apiKey": "semapi",
//         "siteKey": "siteKey",
//         "horaInicialAuto": "23/10/2024 00:12:01",
//         "horaFinalAuto": "23/10/2024 00:12:06",
//         "apiPostLance": "https://nodetst.iv2.com.br/api/socket/bid-sem-captcha/",
//         "hostName": "MDRN-OCI-RPA001",
//         "ultimaAtualizacao": "14/10/2024 15:51:46",
//         "proximaAtualizacao": "15/10/2024 05:45:06",
//         "nuSequencial": "377f7f5e-4412-475e-b9bf-5db1fe306c57",
//         "leituraUnica": 1,
//         "horaInicio": "23/10/2024 00:11:51"
//     };

//     const botController = new BotController(config);
//     const page = await botController.initPage();

//     expect(page).toBeTruthy();
// });

// test('should login', async () => {
//     const config: configs = {
//         "id": 1,
//         "idInputUsuario": "username",
//         "idInputSenha": "password",
//         "idBotaoLogin": "login",
//         "idBotaoLance": "newBidButton",
//         "usuario": "sistema",
//         "senha": "1!@#SAWOLK",
//         "urlLogin": "https://nodetst.iv2.com.br/sign-in?redirect_url=https%3A%2F%2Fnodetst.iv2.com.br%2F",
//         "urlDisputa": "https://nodetst.iv2.com.br/api/lances-html/377f7f5e-4412-475e-b9bf-5db1fe306c57",
//         "tituloDisputa": "Sem Captcha",
//         "valorMinimo": "200.000,00",
//         "idInputLance": "newBid",
//         "lanceInicial": "",
//         "redutor": "5,00",
//         "auto": 0,
//         "horaFinal": "23/10/2024 00:12:51",
//         "redutorAuto": "2,00",
//         "apiKey": "semapi",
//         "siteKey": "siteKey",
//         "horaInicialAuto": "23/10/2024 00:12:01",
//         "horaFinalAuto": "23/10/2024 00:12:06",
//         "apiPostLance": "https://nodetst.iv2.com.br/api/socket/bid-sem-captcha/",
//         "hostName": "MDRN-OCI-RPA001",
//         "ultimaAtualizacao": "14/10/2024 15:51:46",
//         "proximaAtualizacao": "15/10/2024 05:45:06",
//         "nuSequencial": "377f7f5e-4412-475e-b9bf-5db1fe306c57",
//         "leituraUnica": 1,
//         "horaInicio": "23/10/2024 00:11:51"
//     };

//     const botController = new BotController(config);
//     const page = await botController.initPage();
    
//     await botController.login(page);

//     expect(page).toHaveTitle('alo');
// });

// // describe('BotController', () => {
// //     it('should init page', async () => {
// //         const config: configs = {
// //             "id": 1,
// //             "idInputUsuario": "username",
// //             "idInputSenha": "password",
// //             "idBotaoLogin": "login",
// //             "idBotaoLance": "newBidButton",
// //             "usuario": "sistema",
// //             "senha": "1!@#SAWOLK",
// //             "urlLogin": "https://nodetst.iv2.com.br/sign-in?redirect_url=https%3A%2F%2Fnodetst.iv2.com.br%2F",
// //             "urlDisputa": "https://nodetst.iv2.com.br/api/lances-html/377f7f5e-4412-475e-b9bf-5db1fe306c57",
// //             "tituloDisputa": "Sem Captcha",
// //             "valorMinimo": "200.000,00",
// //             "idInputLance": "newBid",
// //             "lanceInicial": "",
// //             "redutor": "5,00",
// //             "auto": 0,
// //             "horaFinal": "23/10/2024 00:12:51",
// //             "redutorAuto": "2,00",
// //             "apiKey": "semapi",
// //             "siteKey": "siteKey",
// //             "horaInicialAuto": "23/10/2024 00:12:01",
// //             "horaFinalAuto": "23/10/2024 00:12:06",
// //             "apiPostLance": "https://nodetst.iv2.com.br/api/socket/bid-sem-captcha/",
// //             "hostName": "MDRN-OCI-RPA001",
// //             "ultimaAtualizacao": "14/10/2024 15:51:46",
// //             "proximaAtualizacao": "15/10/2024 05:45:06",
// //             "nuSequencial": "377f7f5e-4412-475e-b9bf-5db1fe306c57",
// //             "leituraUnica": 1,
// //             "horaInicio": "23/10/2024 00:11:51"
// //         };

// //         const botController = new BotController(config);
// //         const page = await botController.initPage();

// //         expect(page).toBeTruthy();
// //     });

// //     it('should login', async () => {
// //         const config: configs = {
// //             "id": 1,
// //             "idInputUsuario": "username",
// //             "idInputSenha": "password",
// //             "idBotaoLogin": "login",
// //             "idBotaoLance": "newBidButton",
// //             "usuario": "sistema",
// //             "senha": "1!@#SAWOLK",
// //             "urlLogin": "https://nodetst.iv2.com.br/sign-in?redirect_url=https%3A%2F%2Fnodetst.iv2.com.br%2F",
// //             "urlDisputa": "https://nodetst.iv2.com.br/api/lances-html/377f7f5e-4412-475e-b9bf-5db1fe306c57",
// //             "tituloDisputa": "Sem Captcha",
// //             "valorMinimo": "200.000,00",
// //             "idInputLance": "newBid",
// //             "lanceInicial": "",
// //             "redutor": "5,00",
// //             "auto": 0,
// //             "horaFinal": "23/10/2024 00:12:51",
// //             "redutorAuto": "2,00",
// //             "apiKey": "semapi",
// //             "siteKey": "siteKey",
// //             "horaInicialAuto": "23/10/2024 00:12:01",
// //             "horaFinalAuto": "23/10/2024 00:12:06",
// //             "apiPostLance": "https://nodetst.iv2.com.br/api/socket/bid-sem-captcha/",
// //             "hostName": "MDRN-OCI-RPA001",
// //             "ultimaAtualizacao": "14/10/2024 15:51:46",
// //             "proximaAtualizacao": "15/10/2024 05:45:06",
// //             "nuSequencial": "377f7f5e-4412-475e-b9bf-5db1fe306c57",
// //             "leituraUnica": 1,
// //             "horaInicio": "23/10/2024 00:11:51"
// //         };

// //         const botController = new BotController(config);
// //         const page = await botController.initPage();
        
// //         await botController.login(page);

// //         expect(page).toHaveTitle('alo');
// //     }, 10000);
// // });