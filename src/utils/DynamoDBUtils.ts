import { BatchWriteItemCommand, BatchWriteItemCommandInput, DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput } from "@aws-sdk/client-dynamodb";

const ddbClient: DynamoDBClient = new DynamoDBClient({})

export async function getBank(routingNumber: string): Promise<GetItemCommandOutput> {
    const params: GetItemCommandInput = {
        TableName: process.env.ROUTING_TABLE,
        Key: {
            PK: {
                S: routingNumber
            }
        }
    }

    let data: GetItemCommandOutput;
    try {
        data = await ddbClient.send(new GetItemCommand(params));
    } catch (error) {
        throw error
    }

    return data;
}

export async function batchWrite(items: { routingnumber: string, name: string, address1: string, address2: string }[]) {
    let params: BatchWriteItemCommandInput = {
        RequestItems: {
            [process.env.ROUTING_TABLE]: items.map(item => (
                {
                    PutRequest: {
                        Item: {
                            PK: {
                                S: item.routingnumber
                            },
                            name: {
                                S: item.name
                            },
                            address1: {
                                S: item.address1
                            },
                            address2: {
                                S: item.address2
                            }
                        }
                    }
                }
            ))
        }
    }
    await ddbClient.send(new BatchWriteItemCommand(params));
}