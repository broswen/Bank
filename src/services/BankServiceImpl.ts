import { BatchWriteItemCommand, BatchWriteItemCommandInput, BatchWriteItemCommandOutput, DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput, PutItemCommand, PutItemCommandInput, PutItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { Bank } from "../models/Bank";
import { BankNotFoundError } from "../models/BankNotFoundError";
import { BankService } from "./BankService";


export class BankServiceImpl implements BankService {


    private ddbClient: DynamoDBClient
    constructor(ddbClient: DynamoDBClient) {
        this.ddbClient = ddbClient
    }

    async getBank(routingNumber: string, countryCode: string): Promise<Bank> {
        const params: GetItemCommandInput = {
            TableName: process.env.ROUTING_TABLE,
            Key: {
                PK: {
                    S: routingNumber
                },
                SK: {
                    S: countryCode
                }
            }
        }

        let data: GetItemCommandOutput;
        try {
            data = await this.ddbClient.send(new GetItemCommand(params));
        } catch (error) {
            throw error
        }

        if (data.Item === undefined) {
            throw new BankNotFoundError()
        }

        return {
            countryCode: data.Item.SK.S,
            routingNumber: data.Item.PK.S,
            name: data.Item.name.S,
            addressLine1: data.Item.address1.S,
            addressLine2: data.Item.address2.S,
        }


    }

    async saveBank(bank: Bank): Promise<Bank> {
        const params: PutItemCommandInput = {
            TableName: process.env.ROUTING_TABLE,
            Item: {
                PK: {
                    S: bank.routingNumber
                },
                SK: {
                    S: bank.countryCode
                },
                name: {
                    S: bank.name
                },
                address1: {
                    S: bank.addressLine1
                },
                address2: {
                    S: bank.addressLine2
                }
            }
        }

        let response: PutItemCommandOutput

        try {
            response = await this.ddbClient.send(new PutItemCommand(params))
        } catch (error) {
            throw error
        }

        return bank
    }

    async batchSaveBank(banks: Bank[]): Promise<number> {

        const params: BatchWriteItemCommandInput = {
            RequestItems: {
                [process.env.ROUTING_TABLE]: banks.map(item => (
                    {
                        PutRequest: {
                            Item: {
                                PK: {
                                    S: item.routingNumber
                                },
                                SK: {
                                    S: item.countryCode
                                },
                                name: {
                                    S: item.name
                                },
                                address1: {
                                    S: item.addressLine1
                                },
                                address2: {
                                    S: item.addressLine2
                                }
                            }
                        }
                    }
                ))
            }
        }

        let output: BatchWriteItemCommandOutput
        try {
            output = await this.ddbClient.send(new BatchWriteItemCommand(params));
        } catch (error) {
            throw error
        }

        let unprocessedItems = 0
        if (output.UnprocessedItems && output.UnprocessedItems[process.env.ROUTING_TABLE]) {
            unprocessedItems = output.UnprocessedItems[process.env.ROUTING_TABLE].length
        }

        return banks.length - unprocessedItems
    }
}