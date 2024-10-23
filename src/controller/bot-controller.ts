import { Browser, chromium, Page } from "@playwright/test";
import { configs } from "@prisma/client";
import logger from "../lib/logger";

export default class BotController {
    browser: Browser | undefined;
    page: Page | undefined;
    lastBid: number = 0;

    constructor(
        private config: configs
    ) {

    }

    public async startBot() {
        try {
            logger.info(this.config, 'Config selecionada. Iniciando bot...');

            await this.login();
            await new Promise(resolve => setTimeout(resolve, 2000));

            this.iniciarLances();
            this.iniciaRajadaLances();
        } catch (error) {
            logger.error(error, 'Falha ao iniciar bot');
            throw error;
        }
    }

    private async login() {
        try {
            logger.info('Realizando login...')

            this.browser = await chromium.launch({ headless: false });
            const context = await this.browser.newContext();
    
            this.page = await context.newPage();
    
            await this.page?.goto(String(this.config.urlLogin));
    
            await new Promise(resolve => setTimeout(resolve, 2000));
    
            await this.page?.fill(`input[name="${String(this.config.idInputUsuario)}"]`, String(this.config.usuario));
            await this.page?.fill(`input[name="${String(this.config.idInputSenha)}"]`, String(this.config.senha));
            await this.page?.click(`button[name="${String(this.config.idBotaoLogin)}"]`);
    
            logger.info('Login realizado com sucesso');
        } catch (error) {
            logger.error(error, 'Falha ao realizar login');
            throw error;
        }
    }

    private async iniciarLances() {
        try {
            if (!this.checkHoraInicial()) {
                console.log('#### Aguardando horario para iniciar lances ####');

                await new Promise(resolve => setTimeout(resolve, 1000));
                this.iniciarLances();
                
                return;
            }

            logger.info('Iniciando lances...');

            if (this.checkHoraFinal()) {
                logger.info('Hora final atingida, finalizando cobertura de valores');
                return false;
            }

            const lastValue = this.parseStringCurrencyToNumber(String(await this.consultarValorAtualizado()));

            if (this.lastBid === 0 || lastValue < this.lastBid) {
                logger.info({ lastValue, lastBid: this.lastBid }, 'Mudança de valor detectada. Realizando novo lance...');

                const redutor = this.parseRedutorToNumber(String(await this.config.redutor));
                const nextValue = await this.realizarLance(lastValue, redutor);

                this.lastBid = nextValue;

                logger.info(nextValue, 'Lance realizado');
            }

            this.iniciarLances();
        } catch (error) {
            logger.error(error, 'Falha ao iniciar lances');
            throw error;
        }
    }

    private async consultarValorAtualizado() {
        try {
            const lastValue = await this.page?.evaluate(async (urlDisputa) => {
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
    
            console.log('#### Valor atualizado consultado ####', lastValue);
    
            return lastValue;
        } catch (error) {
            logger.error(error, 'Falha ao consultar valor atualizado');
            throw error;
        }
    }

    private async realizarLance(lastValue: number, redutor: number) {
        try {
            const nextValue = lastValue - redutor;
            
            logger.info({ lastValue, redutor, nextValue }, 'Realizando Lance');
            
            this.validaValorMinimo(nextValue);

            const apiPost = this.config.apiPostLance;
            const numSequencial = this.config.nuSequencial;

            const response = await this.page?.evaluate(async (params) => {
                const [nextValue, apiPost, numSequencial] = params;

                const response = await fetch(String(apiPost), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // body: JSON.stringify({
                    //     roomId: numSequencial,
                    //     amount: nextValue
                    // })
                    body: JSON.stringify({
                        'ano': '2024',
                        'nuSequencial': numSequencial,
                        'idInteressado': '03887831000115',
                        'valorLance': nextValue
                    })
                });

                return response;
            }, [nextValue, apiPost, numSequencial]);

            // console.log('#### Requisição enviada ####');
            // console.log('#### Resposta recebida ####', response);

            // if (!response?.ok) {
            //     console.log(`Erro na requisição: ${response?.status} `);
            // }

            // const result = await response?.json();

            // console.log('#### Resultado da requisição ####', result);

            return nextValue;
        } catch (error) {
            logger.error(error, 'Falha ao realizar lance');
            throw error;
        }
    }

    private async validaValorMinimo(nextValue: number) {
        const valorMinimo = this.parseStringCurrencyToNumber(String(this.config.valorMinimo));

        if (nextValue < valorMinimo) {
            logger.info({ nextValue, valorMinimo }, 'Lance menor que o valor minimo, encerrando execução');
            throw '[ALERTA!!!] - Lance menor que o valor minimo, encerrando execução';
        }
    }

    private parseStringCurrencyToNumber(value: string): number {
        if (!value) return 0;
        return Number(value.replace('R$', '').replace(/\./g, '').replace(',', '.'));
    }

    private parseRedutorToNumber(value: string): number {
        if (!value) return 0;
        return Number(value.replace(',', '.'));
    }

    private convertToTimestamp(dateString: string): number {
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);

        const date = new Date(year, month - 1, day, hours, minutes, seconds);
        return date.getTime();
    }

    private checkHoraInicial() {
        const horaInicio = this.config.horaInicio;

        if (!horaInicio) {
            logger.info('Hora inicial nula, encerrando execução');
            throw '[ALERTA!!!] - Hora inicio nula, encerrando execução';
        }

        const horaInicioDate = new Date(this.convertToTimestamp(horaInicio)).getTime();
        const horaAtual = new Date().getTime();

        return horaAtual >= horaInicioDate;
    }

    private checkHoraFinal() {
        const horaFinal = this.config.horaFinal;

        if (!horaFinal) {
            logger.info('Hora final nula, encerrando execução');
            throw '[ALERTA!!!] - Hora final nula, encerrando execução';
        }

        const horaFinalDate = new Date(this.convertToTimestamp(horaFinal)).getTime();
        const horaAtual = new Date().getTime();

        return horaAtual >= horaFinalDate;
    }

    private checkHoraFinalAuto() {
        const horaFinalAuto = this.config.horaFinalAuto;

        if (!horaFinalAuto) {
            logger.info('Hora final atingida, encerrando execução');
            throw '[ALERTA!!!] - HorafinalAuto nula, encerrando execução';
        }

        const horaFinalAutoDate = new Date(this.convertToTimestamp(horaFinalAuto)).getTime();
        const horaAtual = new Date().getTime();

        if (horaAtual >= horaFinalAutoDate) {
            console.log('[ALERTA!!!] - Hora final atingida, encerrando execução');
            throw '[ALERTA!!!] - Hora final atingida, encerrando execução';
        }
    }

    private checkHoraInicialAndFinalAuto() {
        const horaInicialAuto = this.config.horaInicialAuto;
        const horaFinalAuto = this.config.horaFinalAuto;

        if (!horaInicialAuto) {
            logger.info('Hora inicial nula, encerrando execução');
            throw '[ALERTA!!!] - Hora final nula, encerrando execução';
        }

        if (!horaFinalAuto) {
            logger.info('Hora final nula, encerrando execução');
            throw '[ALERTA!!!] - Hora final nula, encerrando execução';
        }


        const horaInicialAutoDate = new Date(this.convertToTimestamp(horaInicialAuto)).getTime();
        const horaFinalAutoDate = new Date(this.convertToTimestamp(horaFinalAuto)).getTime();
        const horaAtual = new Date().getTime();

        return (horaAtual >= horaInicialAutoDate && horaAtual <= horaFinalAutoDate);
    }

    private async iniciaRajadaLances() {
        this.checkHoraFinalAuto();

        if (this.checkHoraInicialAndFinalAuto()) {
            await this.rajadaDeLances();
        }

        await new Promise((resolve) => setTimeout(resolve, 10));

        this.iniciaRajadaLances();
    }

    private async rajadaDeLances() {
        logger.info('Iniciando Rajada de Lances...');

        let value = this.parseStringCurrencyToNumber(String(await this.consultarValorAtualizado()));

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

        let continuawhile = this.checkHoraInicialAndFinalAuto();
        const redutor = this.parseRedutorToNumber(String(await this.config.redutorAuto));

        while (continuawhile) {

            this.realizarLance(value, redutor);
            value = value - redutor;

            await new Promise(resolve => setTimeout(resolve, 25));

            const seconds: any = new Date().getSeconds();
            time[seconds] = time[seconds] + 1;

            logger.info({ value }, 'Lance realizado');

            continuawhile = this.checkHoraInicialAndFinalAuto();
        }

        logger.info('Fim da Rajada de Lances');
        logger.info(time, 'Media de Lances por segundo');
    }

    public async stopBot() {
        await this.browser?.close();
    }
}