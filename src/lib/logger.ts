import pino from "pino";

function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}

const transport = pino.transport({
    targets: [
        {
            target: 'pino-pretty',
            options: {
                destination: `./logs/bot-${getCurrentDate()}.log`,
                mkdir: true,
                colorize: false
            }
        }, {
            target: 'pino-pretty',
            options: {
                destination: process.stdout.fd,
            }
        }
    ]
});

export default pino(transport);
