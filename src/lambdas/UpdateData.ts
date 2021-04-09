'use strict';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { batchWrite } from "../utils/DynamoDBUtils";


const ddbClient: DynamoDBClient = new DynamoDBClient({});
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

  let items: { routingnumber: string, name: string, address1: string, address2: string }[] = [];
  let totalItems = 0;
  for await (let item of parser) {
    console.log(item);
    items.push(item);
    if (items.length > 9) {
      await batchWrite(items);
      totalItems += items.length;
      items = [];
    }

  }

  if (items) {
    try {
      await batchWrite(items);
    } catch (error) {
      console.error(error)
      throw error
    }
    totalItems += items.length;
  }
  console.info(`Updated ${totalItems} banks in ${process.env.ROUTING_TABLE}`)
  return 'OK';
};