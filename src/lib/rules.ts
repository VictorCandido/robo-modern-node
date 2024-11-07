import { configs } from "@prisma/client";
import logger from "./logger";
import { convertToTimestamp, parseStringCurrencyToNumber } from "./utils";
import ResponseModel from "../model/response-model";

/**
 * Checks if the current time has surpassed the final automated hour (horaFinalAuto) specified in the configuration.
 * Logs and throws an error if horaFinalAuto is not set.
 * Converts the horaFinalAuto from the configuration to a timestamp and compares it with the current time.
 * 
 * @param config - Configuration object containing the horaFinalAuto property.
 * @returns {boolean} - Returns true if the current time is greater than or equal to horaFinalAutoDate.
 * @throws {ResponseModel} - Throws an error if horaFinalAuto is not set in the configuration.
 */
export function checkHoraFinalAuto(config: configs) {
    const horaFinalAuto = config.horaFinalAuto;

    if (!horaFinalAuto) {
        logger.info('#### Hora final atingida, encerrando execução');
        throw new ResponseModel('CONFIG_NOT_FOUND', true, 'HorafinalAuto nula, encerrando execução');
    }

    const horaFinalAutoDate = new Date(convertToTimestamp(horaFinalAuto)).getTime();
    const horaAtual = new Date().getTime();

    return (horaAtual >= horaFinalAutoDate);
}

/**
 * Checks if the current time is within the range of the initial automated hour (horaInicialAuto) and final automated hour (horaFinalAuto) specified in the configuration.
 * Logs and throws an error if either horaInicialAuto or horaFinalAuto is not set.
 * Converts the horaInicialAuto and horaFinalAuto from the configuration to timestamps and compares them with the current time.
 * 
 * @param config - Configuration object containing the horaInicialAuto and horaFinalAuto properties.
 * @returns {boolean} - Returns true if the current time is greater than or equal to horaInicialAutoDate and less than or equal to horaFinalAutoDate.
 * @throws {ResponseModel} - Throws an error if either horaInicialAuto or horaFinalAuto is not set in the configuration.
 */
export function checkHoraInicialAndFinalAuto(config: configs) {
    const horaInicialAuto = config.horaInicialAuto;
    const horaFinalAuto = config.horaFinalAuto;

    if (!horaInicialAuto) {
        logger.info('#### Hora inicial nula, encerrando execução');
        throw new ResponseModel('CONFIG_NOT_FOUND', true, 'Hora inicial nula, encerrando execução');  
    }

    if (!horaFinalAuto) {
        logger.info('#### Hora final nula, encerrando execução');
        throw new ResponseModel('CONFIG_NOT_FOUND', true, 'Hora final nula, encerrando execução');
    }


    const horaInicialAutoDate = new Date(convertToTimestamp(horaInicialAuto)).getTime();
    const horaFinalAutoDate = new Date(convertToTimestamp(horaFinalAuto)).getTime();
    const horaAtual = new Date().getTime();

    return (horaAtual >= horaInicialAutoDate && horaAtual <= horaFinalAutoDate);
}

/**
 * Checks if the next bid value is greater than or equal to the minimum value specified in the configuration.
 * Logs and throws an error if the next value is less than the minimum value.
 * 
 * @param nextValue - The value of the next bid.
 * @param config - Configuration object containing the valorMinimo property.
 * @returns {boolean} - Returns true if the next value is greater than or equal to the minimum value.
 * @throws {string} - Throws an error if the next value is less than the minimum value.
 */
export function validaValorMinimo(nextValue: number, config: configs) {
    const valorMinimo = parseStringCurrencyToNumber(String(config.valorMinimo));
    logger.info({ nextValue, valorMinimo }, '#### Validando valor mínimo');
    return !(nextValue < valorMinimo);
}