import { Bank } from "../models/Bank";

export interface BankService {
    getBank(routingNumber: string): Promise<Bank>
    saveBank(bank: Bank): Promise<Bank>
    batchSaveBank(banks: Bank[]): Promise<number>
}