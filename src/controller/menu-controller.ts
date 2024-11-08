import readline from "readline";
import ConfigController from "./config-controller";
import BotController from "./bot-controller";
// import BotController from "./bot-controller-bkp";

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
    }

    public async promptUser() {
        await this.displayBotMenu();
        this.rl.question('Digite a opção: ', this.handleBotMenuUserInput);
    }
}