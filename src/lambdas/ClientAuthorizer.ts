'use strict';

import { DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
const winston = require('winston');

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console()
    ]
})

const ddbClient = new DynamoDBClient({});


module.exports.handler = async (event) => {

    logger.info("authorizing client", event)


    if (event.identitySource.length < 1) {
        return generateResponse(event.identitySource, '', false)
    }


    const params: GetItemCommandInput = {
        TableName: process.env.CLIENTSTABLE,
        Key: {
            PK: {
                S: event.identitySource[0]
            }
        }
    }

    let data: GetItemCommandOutput
    try {
        data = await ddbClient.send(new GetItemCommand(params))
    } catch (error) {
        logger.error("error getting client id", error)
        return "Error"
    }

    if (data.Item === undefined) {
        return generateResponse(event.identitySource[0], '', false)
    }

    if (!data.Item.valid.BOOL) {
        return generateResponse(data.Item.PK.S, data.Item.name.S, false)
    }

    return generateResponse(data.Item.PK.S, data.Item.name.S, true)
}

const generateResponse = (identitySource, clientName, allow) => {
    logger.info("generating authorization response", {
        time: new Date().toISOString(),
        identitySource: identitySource,
        effect: allow,
        name: clientName
    })

    return {
        "isAuthorized": allow,
        "context": {
            "clientId": identitySource,
            "clientName": clientName
        }
    }
}