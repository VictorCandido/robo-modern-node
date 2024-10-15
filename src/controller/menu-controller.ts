import readline from "readline";
import BotController from "./bot-controller";
import ConfigController from "./config-controller";

export default class MenuController {
    rl: readline.Interface;
    titles: {
        id: number;
        tituloDisputa: string | null;
    }[] = [];

    constructor(
        private configController: ConfigController
    ) {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.handleBotMenuUserInput = this.handleBotMenuUserInput.bind(this);
    }

    private async loadTitles() {
        this.titles = await this.configController.listTitles();
    }

    private async displayBotMenu() {
        console.log('####   PROJETO PO - BOT   ####');
        console.log('');
        console.log('Para seguir, por favor escolha uma das opções:');
        console.log('');
        // console.log('1. Realizar Login');
        // console.log('2. Conectar Certame');
        // console.log('3. Iniciar Lances');
        // console.log('4. Rajada de Lances');
        // console.log('5. Realizar Testes Completo');
        // console.log('6. Encerrar BOT');

        await this.loadTitles();

        this.titles.forEach((title, index) => {
            console.log(`${index + 1}. ${title.tituloDisputa}`);
        })
    }
    private async handleBotMenuUserInput(option: string) {
        const selectedIndex = Number(option.trim()) - 1;

        if (selectedIndex < 0 || selectedIndex >= this.titles.length) {
            console.log('Opção inválida, por favor tente novamente.');
            this.promptUser();
            return;
        }

        const selectedId = this.titles[selectedIndex]?.id;
        const config = await this.configController.listById(selectedId);

        if (!config) {
            return;
        }

        const botController = new BotController(config);
        botController.startBot();


        // switch (option.trim()) {
        //     case '1':
        //         // Realizar Login
        //         await this.botController.login();
        //         this.promptUser();

        //         break;

        //     case '2':
        //         // Conectar Certame
        //         await this.botController.conectarCertame();
        //         this.promptUser();

        //         break;

        //     case '3':
        //         // Iniciar Lances
        //         await this.botController.iniciarLances();
        //         this.promptUser();

        //         break;

        //     case '4':
        //         // Rajada de lances
        //         await this.botController.rajadaDeLances();
        //         this.promptUser();

        //         break;

        //     case '5':
        //         // Realizar Testes Completo
        //         await this.botController.testeCompleto();
        //         this.promptUser();

        //         break;

        //     case '6':
        //         // Encerrar BOT
        //         await this.botController.stopBot();
        //         console.log('Encerrando...');
        //         this.rl.close();

        //         break;
        //     default:
        //         console.log('Opção inválida, por favor tente novamente.');
        // }

    }

    public async promptUser() {
        await this.displayBotMenu();
        this.rl.question('Digite a opção: ', this.handleBotMenuUserInput);
    }
}