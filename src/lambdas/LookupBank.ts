'use strict';

import { GetItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { getBank } from "../utils/DynamoDBUtils";

const middy = require('@middy/core')


const jsonBodyParser = require('@middy/http-json-body-parser');
const httpErrorHandler = require('@middy/http-error-handler');
const validator = require('@middy/validator');
var createError = require('http-errors');
const { NotExtended } = require("http-errors");

const inputSchema = {
  type: 'object',
  properties: {
    pathParameters: {
      type: 'object',
      properties: {
        rn: { type: 'string', minLength: 9, maxLength: 9 }
      },
      required: ['rn']
    }
  }
}

const lookupBank = async (event) => {

  let data: GetItemCommandOutput;
  try {
    data = await getBank(event.pathParameters.rn)
  } catch (error) {
    console.error(error);
    throw createError(500, 'Routing Number lookup error');
  }

  if (data.Item === undefined) {
    throw createError(404, `Bank not found for routing number ${event.pathParameters.rn}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        rn: data.Item.PK.S,
        n: data.Item.name.S,
        a1: data.Item.address1.S,
        a2: data.Item.address2.S
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