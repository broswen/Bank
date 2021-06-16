'use strict';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Bank } from "../models/Bank";
import { BankNotFoundError } from "../models/BankNotFoundError";
import { BankService } from "../services/BankService";
import { BankServiceImpl } from "../services/BankServiceImpl";
const winston = require('winston');
var Parser = require("fast-xml-parser").j2xParser;

var defaultOptions = {
  format: false,
  indentBy: "  ",
  supressEmptyNode: false,
};
const xmlParser = new Parser(defaultOptions)

const bankService: BankService = new BankServiceImpl(new DynamoDBClient({}))

const middy = require('@middy/core')

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({})
  ]
})


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
    logger.error("error getting bank by routing number", error)
    if (error instanceof BankNotFoundError) {
      throw createError(404)
    }

    throw createError(500)
  }

  if (event.headers.accept == "application/xml") {
    let xml = xmlParser.parse(bank)
    return {
      statusCode: 200,
      body: xml
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(bank)
  };
};

const logMiddleware = () => {

  return {
    before: (handler, next) => {
      logger.info("querying bank", handler.event)
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