import { chromium } from "@playwright/test";
import { configs } from "@prisma/client";
import logger from "../lib/logger";
import { checkHoraFinalAuto, checkHoraInicialAndFinalAuto, validaValorMinimo } from "../lib/rules";
import { parseRedutorToNumber, parseStringCurrencyToNumber } from "../lib/utils";
import { Cluster } from "puppeteer-cluster";
import puppeteer, { Page, Browser } from "puppeteer";

export default class BotController {
    browser: Browser | undefined;
    page: Page | undefined;
    lastBid: number = 0;
    totalBids: number = 0;

    constructor(
        private config: configs
    ) {}

    public async startBot() {
        const browser = await this.initBrowser();
        const page = await this.initPage(browser);
        const cluster = await this.initCluster();

        await this.login(page);
        let bidValue = await this.consultarValorAtualizado(page);
        console.log('#### Valor atualizado consultado ####', bidValue);

        const cookies = await page.cookies();

        let countTotalLances = 0;

        let lance = true;

        // while(lance) {
        //     bidValue -= 5;
        //     countTotalLances++;
        //     cluster.queue({ bidValue, cookies });
        //     await new Promise(resolve => setTimeout(resolve, 100));
        // }

        const interval = setInterval(async () => {
            console.log('#### Send cluster queue ####');
            bidValue -= 5;
            countTotalLances++;
            cluster.queue({ bidValue, cookies });
            // await new Promise(resolve => setTimeout(resolve, 100));
        }, 25);

        setTimeout(async () => {
            clearInterval(interval);

            lance = false;

            await this.stopCluster(cluster);
            await this.stopBot(browser);

            console.log('#### Total de lances realizados: ' + countTotalLances);
            console.log('#### Total de lances recebidos: ' + this.totalBids);
            throw '#### Total de lances: ' + countTotalLances;
        }, 5000);
    }
    
    public async initBrowser() {
        const browser = await puppeteer.launch({ headless: true });
        return browser;
    }

    public async initPage(browser: Browser) {
        const page = await browser.newPage();
        return page;

        // const browser = await chromium.launch({ headless: false });
        // const context = await browser.newContext();

        // const pageReturn = await context.newPage();
        // this.page = pageReturn;
        // return pageReturn;
    }

    public async initCluster() {
        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 10,
            puppeteerOptions: {
                headless: true
            },

        });

        // await cluster.queue('', async ({ page }: { page: Page }) => {
        //     await page.goto(String(this.config.urlLogin), { waitUntil: 'networkidle2', });
        // });

        await cluster.task(async ({ page, data }: { page: Page, data: { bidValue: number, cookies: any } }) => {
            console.log('#### Cluster Task ####');

            await page.goto(String(this.config.urlLogin), { waitUntil: 'networkidle2', });
            await page.setCookie(...data.cookies);

            // const response = await this.realizarLance(page, data.bidValue);
            await this.realizarLance(page, data.bidValue);
            this.totalBids++;
            // console.log('#### Cluster Response ####', response);
        });

        return cluster;
    }

    public async login(page: Page) {
        try {
            logger.info('Realizando login...')
    
            await page.goto(String(this.config.urlLogin), { waitUntil: 'networkidle2', });

            await page.type(`input[name="${String(this.config.idInputUsuario)}"]`, String(this.config.usuario));
            await page.type(`input[name="${String(this.config.idInputSenha)}"]`, String(this.config.senha));

            // await new Promise(resolve => setTimeout(resolve, 500));

            await page.click(`button[name="${String(this.config.idBotaoLogin)}"]`);
            await page.waitForNavigation();

            logger.info('Login realizado com sucesso');
        } catch (error) {
            logger.error(error, 'Falha ao realizar login');
            throw error;
        }
    }

    private async consultarValorAtualizado(page: Page) {
        try {
            const lastValue = await page.evaluate(async (urlDisputa) => {
                const response = await fetch(String(urlDisputa));
                const htmlString = await response.text();
    
                const element = document.createElement('div');
                element.innerHTML = htmlString;
                const vrMenorLanceFromRequest = element.querySelector('#vrMenorLance');
    
                console.log(vrMenorLanceFromRequest)
    
                let lastValue = '';
    
                if (vrMenorLanceFromRequest) {
                    lastValue = String(vrMenorLanceFromRequest.textContent);
                }
    
                return lastValue;
            }, String(this.config.urlDisputa));
    
            return parseStringCurrencyToNumber(String(lastValue));
        } catch (error) {
            logger.error(error, 'Falha ao consultar valor atualizado');
            throw error;
        }
    }

    private async realizarLance(page: Page, bidValue: number) {
        try {
            logger.info({ bidValue }, 'Realizando Lance');
            
            // TODO: retornar false se for mínimo e tratar resposta ao usuário
            validaValorMinimo(bidValue, this.config);

            const apiPost = this.config.apiPostLance;
            const numSequencial = this.config.nuSequencial;

            const response = await page.evaluate(async ([bidValue, apiPost, numSequencial] ) => {
                const response = await fetch(String(apiPost), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        roomId: numSequencial,
                        amount: bidValue
                    })
                    // body: JSON.stringify({
                    //     'ano': '2024',
                    //     'nuSequencial': numSequencial,
                    //     'idInteressado': '03887831000115',
                    //     'valorLance': bidValue
                    // })
                });

                console.log('#### Requisição enviada ####', response);

                // if (!response.ok) {
                //     throw new Error(`Failed to fetch: ${response.statusText}`);
                // }

                return response;
            }, [bidValue, apiPost, numSequencial]);

            // console.log('#### Requisição enviada ####');
            // console.log('#### Resposta recebida ####', response);

            // if (!response?.ok) {
            //     console.log(`Erro na requisição: ${response?.status} `);
            // }

            // const result = await response?.json();

            // console.log('#### Resultado da requisição ####', result);

            return response;
        } catch (error) {
            logger.error(error, 'Falha ao realizar lance');
            throw error;
        }
    }

    private async iniciaRajadaLances() {
        console.log('#### Iniciando Rajada de Lances... ####');
        checkHoraFinalAuto(this.config);

        if (checkHoraInicialAndFinalAuto(this.config)) {
            await this.rajadaDeLances();
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        this.iniciaRajadaLances();
    }

    private async rajadaDeLances() {
        logger.info('Iniciando Rajada de Lances...');

        let value = parseStringCurrencyToNumber(String(await this.consultarValorAtualizado()));

        const time: any = {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 0,
            11: 0,
            12: 0,
            13: 0,
            14: 0,
            15: 0,
            16: 0,
            17: 0,
            18: 0,
            19: 0,
            20: 0,
            21: 0,
            22: 0,
            23: 0,
            24: 0,
            25: 0,
            26: 0,
            27: 0,
            28: 0,
            29: 0,
            30: 0,
            31: 0,
            32: 0,
            33: 0,
            34: 0,
            35: 0,
            36: 0,
            37: 0,
            38: 0,
            39: 0,
            40: 0,
            41: 0,
            42: 0,
            43: 0,
            44: 0,
            45: 0,
            46: 0,
            47: 0,
            48: 0,
            49: 0,
            50: 0,
            51: 0,
            52: 0,
            53: 0,
            54: 0,
            55: 0,
            56: 0,
            57: 0,
            58: 0,
            59: 0
        }

        let continuawhile = checkHoraInicialAndFinalAuto(this.config);
        const redutor = parseRedutorToNumber(String(await this.config.redutorAuto));
        let countTotalLances = 0;

        while (continuawhile) {

            this.realizarLance(value, redutor);
            value = value - redutor;

            await new Promise(resolve => setTimeout(resolve, 25));

            const seconds: any = new Date().getSeconds();
            time[seconds] = time[seconds] + 1;

            logger.info({ value }, 'Lance realizado');

            continuawhile = checkHoraInicialAndFinalAuto(this.config);
            countTotalLances++;
        }

        logger.info('Fim da Rajada de Lances');
        logger.info(`Total de lances realizados: ${countTotalLances}`);
        logger.info(time, 'Media de Lances por segundo');
    }

    public async stopBot(browser: Browser) {
        await browser.close();
    }

    public async stopCluster(cluster: Cluster) {
        // await cluster.idle();
        await cluster.close();
    }
}