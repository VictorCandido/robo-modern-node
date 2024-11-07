import { configs } from '@prisma/client';
import * as rules from '../../src/lib/rules';
import ResponseModel from '../../src/model/response-model';

function parseDate(date: number) {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date).replace(',', '')
}

describe('Rules', () => {
    const config: configs = {
        valorMinimo: '300.000,00',
        id: 1,
        idInputUsuario: 'username',
        idInputSenha: 'password',
        idBotaoLogin: 'login',
        idBotaoLance: 'newBidButton',
        usuario: 'sistema',
        senha: '1!@#SAWOLK',
        urlLogin: 'https://nodetst.iv2.com.br/sign-in?redirect_url=https%3A%2F%2Fnodetst.iv2.com.br%2F',
        urlDisputa: 'https://nodetst.iv2.com.br/api/lances-html/377f7f5e-4412-475e-b9bf-5db1fe306c57',
        tituloDisputa: 'Sem Captcha',
        redutor: '0.10',
        horaInicialAuto: '23/10/2024 00:11:51',
        horaFinalAuto: '23/10/2024 05:45:06',
        idInputLance: null,
        lanceInicial: null,
        auto: null,
        horaFinal: null,
        redutorAuto: null,
        apiKey: null,
        siteKey: null,
        apiPostLance: null,
        hostName: null,
        ultimaAtualizacao: null,
        proximaAtualizacao: null,
        nuSequencial: null,
        leituraUnica: null,
        horaInicio: null
    };

    it('should return false when next value is less than database minimum value', () => {
        const respose = rules.validaValorMinimo(299999, config);
        expect(respose).toBeFalsy();
    });

    it('should return true when next value is more than database minimum value', () => {
        const respose = rules.validaValorMinimo(300001, config);
        expect(respose).toBeTruthy();
    });

    it('should thrown an error when there is no hora inicial auto', () => {
        const configData: configs = {
            ...config,
            horaInicialAuto: null
        };

        expect(() => rules.checkHoraInicialAndFinalAuto(configData)).toThrow(ResponseModel);
    });

    it('should thrown an error when there is no hora final auto', () => {
        const configData: configs = {
            ...config,
            horaFinalAuto: null
        };

        expect(() => rules.checkHoraInicialAndFinalAuto(configData)).toThrow(ResponseModel);
        expect(() => rules.checkHoraFinalAuto(configData)).toThrow(ResponseModel);
    });

    it('should return false if actual hour is less than initial hour', () => {
        const nowPlusOneHour = new Date().setHours(new Date().getHours() + 1);
        const nowPlusTwoHour = new Date().setHours(new Date().getHours() + 2);

        const configData: configs = {
            ...config,
            horaInicialAuto: parseDate(nowPlusOneHour),
            horaFinalAuto: parseDate(nowPlusTwoHour)
        };

        const respose = rules.checkHoraInicialAndFinalAuto(configData);
        expect(respose).toBeFalsy();
    });

    it('should return false if actual hour is more than final hour', () => {
        const nowLessOneHour = new Date().setHours(new Date().getHours() - 1);
        const nowLessTwoHour = new Date().setHours(new Date().getHours() - 2);
        
        const configData: configs = {
            ...config,
            horaInicialAuto: parseDate(nowLessOneHour),
            horaFinalAuto: parseDate(nowLessTwoHour)
        };

        const respose = rules.checkHoraInicialAndFinalAuto(configData);
        expect(respose).toBeFalsy();
    });

    it('should return true if actual hour is between initial and final hour', () => {
        const nowLessOneHour = new Date().setHours(new Date().getHours() - 1);
        const nowPlusOneHour = new Date().setHours(new Date().getHours() + 1);
        
        const configData: configs = {
            ...config,
            horaInicialAuto: parseDate(nowLessOneHour),
            horaFinalAuto: parseDate(nowPlusOneHour)
        };

        const respose = rules.checkHoraInicialAndFinalAuto(configData);
        expect(respose).toBeTruthy();
    });

    it('should return false if actual hour is less than final hour', () => {
        const nowPlusOneHour = new Date().setHours(new Date().getHours() + 1);
        
        const configData: configs = {
            ...config,
            horaFinalAuto: parseDate(nowPlusOneHour)
        };

        const respose = rules.checkHoraFinalAuto(configData);
        expect(respose).toBeFalsy();
    });

    it('should return true if actual hour is more or equal than final hour', () => {
        const nowLessOneHour = new Date().setHours(new Date().getHours() - 1);
        
        const configData: configs = {
            ...config,
            horaFinalAuto: parseDate(nowLessOneHour)
        };

        const respose = rules.checkHoraFinalAuto(configData);
        expect(respose).toBeTruthy();
    });
})