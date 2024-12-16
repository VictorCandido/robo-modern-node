test('empty test', () => { })

import { configs } from '@prisma/client';
import { Page, Browser } from 'puppeteer';

import BotController from '../../src/controller/bot-controller';

describe('BotController', () => {
    const config: configs = {
        "id": 1,
        "idInputUsuario": "username",
        "idInputSenha": "password",
        "idBotaoLogin": "login",
        "idBotaoLance": "newBidButton",
        "usuario": "sistema",
        "senha": "1!@#SAWOLK",
        "urlLogin": "https://nodetst.iv2.com.br/sign-in?redirect_url=https%3A%2F%2Fnodetst.iv2.com.br%2F",
        "urlDisputa": "https://nodetst.iv2.com.br/api/lances-html/52d3dc87-541e-4255-92fc-2eae2bed5f3d",
        "tituloDisputa": "Sem Captcha",
        "valorMinimo": "100.000,00",
        "idInputLance": "newBid",
        "lanceInicial": "",
        "redutor": "5,00",
        "auto": 0,
        "horaFinal": "23/10/2024 00:12:51",
        "redutorAuto": "2,00",
        "apiKey": "semapi",
        "siteKey": "siteKey",
        "horaInicialAuto": "23/10/2024 00:12:01",
        "horaFinalAuto": "23/10/2024 00:12:06",
        "apiPostLance": "https://nodetst.iv2.com.br/api/socket/bid-sem-captcha/",
        "hostName": "MDRN-OCI-RPA001",
        "ultimaAtualizacao": "14/10/2024 15:51:46",
        "proximaAtualizacao": "15/10/2024 05:45:06",
        "nuSequencial": "52d3dc87-541e-4255-92fc-2eae2bed5f3d",
        "leituraUnica": 1,
        "horaInicio": "23/10/2024 00:11:51"
    };

    const botController = new BotController(config);
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        browser = await botController.initBrowser({ headless: true });
        page = await botController.initPage(browser);
    });

    it('should init browser', async () => {
        expect(browser).toBeDefined();
        expect(browser).toBeInstanceOf(Browser);
    });

    it('should init page', async () => {
        expect(page).toBeDefined();
        expect(page).toBeInstanceOf(Page);
    });

    it('should login', async () => {
        await botController.login(page);

        expect(page).toBeDefined();
        expect(page).toBeInstanceOf(Page);

        const query = await page.mainFrame().$('#clerk-components');
        expect(query).not.toBeNull();
    });

    it('should check last amount', async () => {
        const lastValue = await botController.consultarValorAtualizado(page);

        expect(lastValue).not.toBeNull();
        expect(lastValue).toBeGreaterThan(0);
    });

    it('should place a bid', async () => {
        const lastValue = await botController.consultarValorAtualizado(page);
        const nextValue = (lastValue - 1);
        const bidResponse = await botController.realizarLance(page, nextValue);

        console.log('#### bidResponse', bidResponse);

        expect(bidResponse?.status).toBeDefined();
        expect(bidResponse?.status).toBe(200);
        expect(bidResponse?.success).toBeTruthy();
        expect(bidResponse?.data.id).toBe(config.nuSequencial);
    });

    it('should return error when placing a wrong bid', async () => {
        const lastValue = await botController.consultarValorAtualizado(page);
        const nextValue = (lastValue);
        const bidResponse = await botController.realizarLance(page, nextValue);

        expect(bidResponse?.status).toBeDefined();
        expect(bidResponse?.status).toBe(400);
        expect(bidResponse?.success).toBeFalsy();
        expect(bidResponse?.data.message).toBe('Invalid amount');
    });

    afterAll(async () => {
        await botController.closeBrowser(browser);
    });
});
