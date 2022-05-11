export class CodeError extends Error {
    code: number;
    constructor(args: any, code: number) {
        super(args);
        this.code = code;
    }
}

