'use strict';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Bank } from "../models/Bank";
import { BankService } from "../services/BankService";
import { BankServiceImpl } from "../services/BankServiceImpl";

const bankService: BankService = new BankServiceImpl(new DynamoDBClient({}))

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

  let bank: Bank | null
  try {
    bank = await bankService.getBank(event.pathParameters.rn)
  } catch (error) {
    console.error(error);
    throw createError(500)
  }

  if (bank === null) {
    throw createError(404)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(bank)
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