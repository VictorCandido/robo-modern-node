import { configs } from "@prisma/client";
import readline from "readline";

import ConfigController from "./config-controller";

export default class MenuController {
    rl: readline.Interface;
    titles: {
        id: number;
        tituloDisputa: string | null;
    }[] = [];

    constructor(private configController: ConfigController) {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
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
        });
    }

    public async promptUser(): Promise<configs> {
        await this.displayBotMenu();

        return new Promise(async (resolve, reject) => {
            this.rl.question('Digite a opção: ', async (option) => {
                const selectedIndex = Number(option.trim()) - 1;

                if (selectedIndex < 0 || selectedIndex >= this.titles.length) {
                    console.log('Opção inválida, por favor tente novamente.');
                    return resolve(await this.promptUser());
                }

                const selectedId = this.titles[selectedIndex]?.id;
                const config = await this.configController.listById(selectedId);

                if (!config) {
                    return reject('Config não encontrada');
                }

                return resolve(config);
            });
        });
    }
}
