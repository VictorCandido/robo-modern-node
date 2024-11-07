
export default class ResponseModel {
    constructor(
        public status: 'SUCESS' | 'END' | 'CONFIG_NOT_FOUND' | 'INTERNAL_ERROR',
        public error: boolean,
        public message: string,
        public data?: any
    ) { }
}
