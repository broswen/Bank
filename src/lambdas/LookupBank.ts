'use strict';

import { DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput } from "@aws-sdk/client-dynamodb";

const ddbClient: DynamoDBClient = new DynamoDBClient({});

const middy = require('@middy/core')


const jsonBodyParser = require('@middy/http-json-body-parser');
const httpErrorHandler = require('@middy/http-error-handler');
const validator = require('@middy/validator');
var createError = require('http-errors');
const { NotExtended } = require("http-errors");

const inputSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        rn: { type: 'string', minLength: 9, maxLength: 9 }
      },
      required: ['rn']
    }
  }
}

const lookupBank = async (event) => {

  const params: GetItemCommandInput = {
    TableName: process.env.ROUTING_TABLE,
    Key: {
      PK: {
        S: event.body.rn
      }
    }
  }

  let data: GetItemCommandOutput;
  try {
    data = await ddbClient.send(new GetItemCommand(params));
  } catch (error) {
    console.error(error);
    throw createError(500, 'Routing Number lookup error');
  }

  if (data.Item === undefined) {
    throw createError(404, `Bank not found for routing number ${event.body.rn}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        rn: data.Item.PK.S,
        name: data.Item.name.S,
        location: data.Item.location.S
      }
    ),
  };
};

const logMiddleware = () => {

  return {
    before: (handler, next) => {
      console.log(handler.event);
      return next();
    },
    after: (handler, next) => {
      next();
    }
  }

}

const handler = middy(lookupBank)
  .use(logMiddleware())
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())

module.exports = { handler }