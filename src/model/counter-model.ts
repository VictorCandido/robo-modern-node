export default class CounterModel {
    public lances: number = 0;
    public respostas: number = 0;
    public lancesPerSeconds: Map<number, number> = new Map();
    public respostasPerSeconds: Map<number, number> = new Map();
    public historicoRespostas: Array<Object> = new Array();

    public toObject() {
        const lancesPerSecondsObject: any = {};
        Array.from(this.lancesPerSeconds.entries()).forEach(([key, value]) => (lancesPerSecondsObject[key] = value));
        const respostasPerSecondsObject: any = {};
        Array.from(this.respostasPerSeconds.entries()).forEach(([key, value]) => (respostasPerSecondsObject[key] = value));
        
        return {
            LANCES: this.lances,
            RESPOSTAS: this.respostas,
            LANCES_POR_SEGUNDO: lancesPerSecondsObject,
            RESPOSTAS_POR_SEGUNDO: respostasPerSecondsObject,
            HISTORICO_DE_RESPOSTAS: this.historicoRespostas,
        }
    }
}