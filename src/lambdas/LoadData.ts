'use strict';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, GetObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { S3Event, SQSEvent } from "aws-lambda";
import { BankService } from "../services/BankService";
import { Bank } from "../models/Bank";
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

module.exports.handler = async (event: SQSEvent) => {

  for (let record of event.Records) {
    let s3Event: S3Event = JSON.parse(record.body)
    for (let s3Record of s3Event.Records) {
      logger.info('bucket', s3Record.s3.bucket)
      logger.info('object', s3Record.s3.object)
      const key: string = s3Record.s3.object.key
      const bucket: string = s3Record.s3.bucket.name

      const getObjectInput: GetObjectCommandInput = {
        Bucket: bucket,
        Key: key
      }

      let file;
      try {
        file = await s3Client.send(new GetObjectCommand(getObjectInput));
      } catch (error) {
        logger.error("error downloading s3 data", error)
        throw error;
      }

      const parser = file.Body.pipe(parse({ columns: true }));
      let items: Bank[] = [];

      let totalItems = 0;
      for await (let item of parser) {
        logger.info("item", item)
        items.push(item);
        if (items.length > 9) {
          const saved = await bankService.batchSaveBank(items);
          totalItems += saved
          items = [];
        }

      }

      if (items.length > 0) {
        try {
          await bankService.batchSaveBank(items);
        } catch (error) {
          logger.error("error batch saving banks", error)
          throw error
        }
        totalItems += items.length;
      }
      logger.info(`Updated ${totalItems} banks in ${process.env.ROUTING_TABLE}`)
    }
  }




  return 'OK';
};