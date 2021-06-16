export class ServiceError extends Error {
    public code!: ServiceErrorCode
    constructor(message: string) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export enum ServiceErrorCode {
    BankNotFound = 'BankNotFound',
    InvalidFormat = 'InvalidFormat'
}