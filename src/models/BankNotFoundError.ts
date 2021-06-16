import { ServiceError, ServiceErrorCode } from "./ServiceError"

export class BankNotFoundError extends ServiceError {
    code = ServiceErrorCode.BankNotFound
    constructor() {
        super('The bank was not found')
    }
}