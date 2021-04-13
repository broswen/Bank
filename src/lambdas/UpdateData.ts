'use strict';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { BankService } from "../services/BankService";
import { BankServiceImpl } from "../services/BankServiceImpl";

const bankService: BankService = new BankServiceImpl(new DynamoDBClient({}))


const s3Client: S3Client = new S3Client({});

const parse = require('csv-parse');
const { Readable } = require("stream");

module.exports.handler = async (event) => {

  const params = {
    Bucket: process.env.DATA_BUCKET,
    Key: process.env.FILE
  }

  let file;
  try {
    file = await s3Client.send(new GetObjectCommand(params));
  } catch (error) {
    console.error(error);
    throw error;
  }

  const parser = file.Body.pipe(parse({ columns: true }));

  let items: { routingNumber: string, name: string, addressLine1: string, addressLine2: string }[] = [];
  let totalItems = 0;
  for await (let item of parser) {
    console.log(item);
    items.push(item);
    if (items.length > 9) {
      const saved = await bankService.batchSaveBank(items);
      totalItems += saved
      items = [];
    }

  }

  if (items) {
    try {
      await bankService.batchSaveBank(items);
    } catch (error) {
      console.error(error)
      throw error
    }
    totalItems += items.length;
  }
  console.info(`Updated ${totalItems} banks in ${process.env.ROUTING_TABLE}`)
  return 'OK';
};