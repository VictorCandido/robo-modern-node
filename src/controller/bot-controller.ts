import { Browser, chromium, Page } from "@playwright/test";
import { configs } from "@prisma/client";

export default class BotController {
    browser: Browser | undefined;
    page: Page | undefined;
    lastBid: number = 0;

    constructor(
        private config: configs
    ) {

    }

    public async startBot() {
        await this.login();
        await new Promise(resolve => setTimeout(resolve, 2000));

        await this.iniciarLances();
    }

    public async stopBot() {
        await this.browser?.close();
    }

    private async login() {
        console.log('#### Iniciando bot ####');

        this.browser = await chromium.launch({ headless: false });
        const context = await this.browser.newContext();

        this.page = await context.newPage();

        console.log('#### Realizando login ####');

        await this.page?.goto(String(this.config.urlLogin));

        await new Promise(resolve => setTimeout(resolve, 2000));

        await this.page?.fill(`input[name="${String(this.config.idInputUsuario)}"]`, String(this.config.usuario));
        await this.page?.fill(`input[name="${String(this.config.idInputSenha)}"]`, String(this.config.senha));
        await this.page?.click(`button[name="${String(this.config.idBotaoLogin)}"]`);

        console.log('#### Login realizado com sucesso ####');
    }

    private async navegarCertame() {
        console.log('#### Navegando para página dos lances ####');

        await this.page?.goto(String(this.config.urlDisputa))

        console.log('#### Lances carregados com sucesso ####');
    }

    private async consultarValorAtualizado() {
        console.log('#### Consultando valor atualizado ####');

        const lastValue = await this.page?.evaluate(async () => {
            const response = await fetch(String(this.config.urlDisputa));
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
        });

        console.log('#### Valor atualizado consultado ####', lastValue);

        return lastValue;
    }

    // public async conectarCertame() {
    //     console.log('#### Conectando com o Certame ####');

    //     await this.page?.evaluate(async () => {
    //         const container = document.querySelector('.container');

    //         console.log(container)

    //         if (container) {
    //             const novaDiv = document.createElement('div');
    //             novaDiv.className = 'card';
    //             novaDiv.innerHTML = `
    //                 <h2>Valores da licitação </h2>
    //                 <p><div type="text" id="vrMenorLance" style="align-self: center">0</div></p>
    //             `;
    //             container.appendChild(novaDiv);
    //         }
    //     })

    //     console.log('#### Div criada no container ####');

    //     const lastValue = await this.consultarValorAtualizado();

    //     await this.page?.evaluate(async (lastValue) => {
    //         const vrMenorLance = document.getElementById('vrMenorLance');

    //         if (vrMenorLance) vrMenorLance.innerHTML = String(lastValue);
    //     }, lastValue);

    //     console.log('#### Valor atualizado com sucesso ####');
    // }

    private async iniciarLances() {
        console.log('#### Iniciando lances ####');

        // consultar valor atualizado
        const lastValue = this.parseStringCurrencyToNumber(String(await this.consultarValorAtualizado()));

        console.log('#### Valor atualizado consultado ####', lastValue);
        console.log('#### Valor do último lance realizado ####', this.lastBid);

        // verificar se valor atualizado é igual último lance
        if (this.lastBid === 0 || lastValue < this.lastBid) {
            // se for menor, criar novo lance
            console.log('#### Criando novo lance ####');
            const nextValue = await this.realizarLance(lastValue);

            this.lastBid = nextValue;
        }

        console.log('#### Lances concluídos ####');

        // repetir
        this.iniciarLances();
    }

    private async realizarLance(lastValue: number) {
        console.log('#### Realizando Lance ####');

        const nextValue = lastValue - 100;

        const response = await this.page?.evaluate(async (nextValue) => {
            const response = await fetch('https://nodetst.iv2.com.br/api/socket/bid-sem-captcha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId: '377f7f5e-4412-475e-b9bf-5db1fe306c57',
                    amount: nextValue
                })
            });

            return response;
        }, nextValue);

        // console.log('#### Requisição enviada ####');
        // console.log('#### Resposta recebida ####', response);

        // if (!response?.ok) {
        //     console.log(`Erro na requisição: ${response?.status} `);
        // }

        // const result = await response?.json();

        // console.log('#### Resultado da requisição ####', result);

        return nextValue;
    }

    private parseStringCurrencyToNumber(value: string): number {
        if (!value) return 0;
        return Number(value.replace('R$', '').replace(/\./g, '').replace(',', '.'));
    }

    private async rajadaDeLances() {
        console.log('#### Rajada de Lances ####');

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

        while (true) {
            this.realizarLance(value);
            value = value - 100;

            await new Promise(resolve => setTimeout(resolve, 40));

            const seconds: any = new Date().getSeconds();
            time[seconds] = time[seconds] + 1;

            console.log('#### Lances realizados ####', value);
            console.log('#### Lances por segundo ####', time);
        }
    }

    // private async testeCompleto() {
    //     console.log('#### Teste Completo ####');

    //     await this.navegarCertame();

    //     await new Promise(resolve => setTimeout(resolve, 1000));

    //     await this.iniciarLances();
    // }
}