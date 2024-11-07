import { configs } from "@prisma/client";
import puppeteer, { Browser, Page } from "puppeteer";
import logger from "../lib/logger";
import { checkHoraFinalAuto, checkHoraInicialAndFinalAuto, validaValorMinimo } from "../lib/rules";
import { parseRedutorToNumber, parseStringCurrencyToNumber } from "../lib/utils";
import CounterModel from "../model/counter-model";
import ResponseModel from "../model/response-model";

export default class BotController {
    private readonly TOTAL_ABAS = 5;    
    private counters = new CounterModel();

    constructor(
        private config: configs
    ) {}

    public async startBot() {
        logger.info(this.config, '#### Config selecionada. Iniciando bot ####');
        const browser = await this.initBrowser();

        try {
            
            const pageArray = new Array();
    
            logger.info({ abas: this.TOTAL_ABAS }, '#### Iniciando abas');
    
            for (let i = 0; i < this.TOTAL_ABAS; i++) {
                const page = await this.initPage(browser);
                await this.login(page);
                pageArray.push(page);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
    
            logger.info('#### Abas iniciadas');
    
            const bidValue = await this.consultarValorAtualizado(pageArray[0]);
            logger.info({ bidValue }, '#### Valor atualizado consultado');
    
            await this.initSequenciaDeLances(pageArray, bidValue);
            this.stopBot(browser);
    
            logger.info('#### Encerrando bot...');
            logger.info(this.counters.toObject(), '#### Resultado final ####');
        } catch (error) {
            await this.stopBot(browser);

            if (error instanceof ResponseModel) {
                if (error.status === 'CONFIG_NOT_FOUND') {
                    logger.info(error, '#### Falha na configuração do bot. Por favor analisar banco de dados e iniciar novamente ####');
                    throw error;
                }

                if (error.status === 'INTERNAL_ERROR') {
                    logger.info(error, '#### Falha na execução do bot. Por favor analisar logs e iniciar novamente ####');
                    throw error;
                }

                if (error.status === 'END') {
                    logger.info(error, '#### Resposta do bot. Encerrando processamento ####');
                    return;
                }
            }

            logger.error(error, '#### Falha na execução do bot');
        }
    }
    
    /**
     * Initializes a Puppeteer browser instance.
     * 
     * Launches a new browser instance with the headless option set to true,
     * hiding the browser window during execution.
     * 
     * @returns {Promise<Browser>} A promise that resolves to the launched browser instance.
     */
    public async initBrowser() {
        const browser = await puppeteer.launch({ headless: true });
        return browser;
    }

    public async initPage(browser: Browser) {
        const page = await browser.newPage();
        return page;
    }

    public async login(page: Page) {
        try {
            logger.info('#### Realizando login...')

            await page.goto(String(this.config.urlLogin), { waitUntil: 'networkidle2', });

            await page.type(`input[name="${String(this.config.idInputUsuario)}"]`, String(this.config.usuario));
            await page.type(`input[name="${String(this.config.idInputSenha)}"]`, String(this.config.senha));

            // await new Promise(resolve => setTimeout(resolve, 500));

            await page.click(`button[name="${String(this.config.idBotaoLogin)}"]`);
            await page.waitForNavigation();

            logger.info('#### Login realizado com sucesso');
        } catch (error) {
            logger.error(error, '#### Falha ao realizar login');
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
            logger.error(error, '#### Falha ao consultar valor atualizado');
            throw error;
        }
    }

    private async initSequenciaDeLances(pageArray: Array<Page>, bidValue: number) {
        logger.info('#### Iniciando sequência de lances');

        try {
            const horaFinal = checkHoraFinalAuto(this.config);
            if (horaFinal) throw new ResponseModel('END', false, 'Hora final atingida, encerrando execução');

            if (checkHoraInicialAndFinalAuto(this.config)) {
                await this.executeSequenciaDeLances(pageArray, bidValue);
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.initSequenciaDeLances(pageArray, bidValue);
        } catch (error) {
            logger.error(error, '#### Falha ao iniciar sequência de lances');
            throw error;
        }
    }

    private async executeSequenciaDeLances(pageArray: Array<Page>, bidValue: number) {
        logger.info('#### Executando Sequência de Lances ####');

        try {
            let currentBidValue = bidValue;

            let continuawhile = checkHoraInicialAndFinalAuto(this.config);
            const redutor = parseRedutorToNumber(String(this.config.redutorAuto));

            while (continuawhile) {
                for (let page of pageArray) {
                    currentBidValue -= redutor;
                    this.realizarLance(page, currentBidValue);

                    this.counters.lances++;
                    this.incrementLanceCounter();
                    
                    continuawhile = checkHoraInicialAndFinalAuto(this.config);
                    if (!continuawhile) break;

                    await new Promise(resolve => setTimeout(resolve, 25));
                }
            }
        } catch (error) {
            logger.error(error, '#### Falha ao executar sequência de lances');
            throw error;
        }
    }

    private incrementLanceCounter() {
        const currentSecond = new Date().getSeconds();
        if (this.counters.lancesPerSeconds.has(currentSecond)) {
            this.counters.lancesPerSeconds.set(currentSecond, this.counters.lancesPerSeconds.get(currentSecond)! + 1);
        } else {
            this.counters.lancesPerSeconds.set(currentSecond, 1);
        }
    }

    private incrementRespostasCounter() {
        const currentSecond = new Date().getSeconds();
        if (this.counters.respostasPerSeconds.has(currentSecond)) {
            this.counters.respostasPerSeconds.set(currentSecond, this.counters.respostasPerSeconds.get(currentSecond)! + 1);
        } else {
            this.counters.respostasPerSeconds.set(currentSecond, 1);
        }
    }

    private async realizarLance(page: Page, bidValue: number) {
        try {
            logger.info({ bidValue }, '#### Realizando Lance');
            
            const isValid = validaValorMinimo(bidValue, this.config);
            if (!isValid) throw new ResponseModel('END', false, 'Lance menor que o valor minimo, encerrando execução');

            const apiPost = this.config.apiPostLance;
            const numSequencial = this.config.nuSequencial;

            try {
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
    
                    return response;
                }, [bidValue, apiPost, numSequencial]);

                this.counters.respostas++;
                this.incrementRespostasCounter();
    
                return response;
            } catch (error) {
                logger.error(error, '#### Falha na executação do evaluate durante o lance');    
            }
        } catch (error) {
            logger.error(error, '#### Falha ao realizar lance');
            throw error;
        }
    }

    public stopBot(browser: Browser) {
        // do something when app is closing
        process.on('exit', async () => await this.closeBrowser(browser));

        // catches ctrl+c event
        process.on('SIGINT', async () => await this.closeBrowser(browser));

        // catches "kill pid" (for example: nodemon restart)
        process.on('SIGUSR1', async () => await this.closeBrowser(browser));
        process.on('SIGUSR2', async () => await this.closeBrowser(browser));

        // catches uncaught exceptions
        process.on('uncaughtException', async () => await this.closeBrowser(browser));
    }

    private async closeBrowser(browser: Browser) {
        logger.info('#### Encerrando bot...');
        await browser.close();
    }

}