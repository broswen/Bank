'use strict';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { BankService } from "../services/BankService";
import { BankServiceImpl } from "../services/BankServiceImpl";
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

const bankService: BankService = new BankServiceImpl(new DynamoDBClient({}))

const s3Client: S3Client = new S3Client({});

const parse = require('csv-parse');
const { Readable } = require("stream");

module.exports.handler = async (event) => {

  logger.info("event", event)
  // const params = {
  //   Bucket: process.env.DATA_BUCKET,
  //   Key: process.env.FILE
  // }

  // let file;
  // try {
  //   file = await s3Client.send(new GetObjectCommand(params));
  // } catch (error) {
  //   logger.error("error downloading s3 data", error)
  //   throw error;
  // }

  // const parser = file.Body.pipe(parse({ columns: true }));

  // let items: { routingNumber: string, countryCode: string, name: string, addressLine1: string, addressLine2: string }[] = [];
  // let totalItems = 0;
  // for await (let item of parser) {
  //   logger.info("item", item)
  //   items.push(item);
  //   if (items.length > 9) {
  //     const saved = await bankService.batchSaveBank(items);
  //     totalItems += saved
  //     items = [];
  //   }

  // }

  // if (items) {
  //   try {
  //     await bankService.batchSaveBank(items);
  //   } catch (error) {
  //     logger.error("error batch saving banks", error)
  //     throw error
  //   }
  //   totalItems += items.length;
  // }
  // logger.info(`Updated ${totalItems} banks in ${process.env.ROUTING_TABLE}`)
  return 'OK';
};