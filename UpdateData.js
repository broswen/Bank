'use strict';

const {DynamoDBClient, BatchWriteItemCommand} = require("@aws-sdk/client-dynamodb");
const {S3Client, GetObjectCommand} = require("@aws-sdk/client-s3");

const dynamoClient = new DynamoDBClient();
const s3Client = new S3Client();

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

  const parser = file.Body.pipe(parse({columns: true, delimiter: ';'}));

  let items = [];
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
    await batchWrite(items);
    totalItems+=items.length;
  }
  console.info(`Uploaded ${totalItems} to ${process.env.ROUTING_TABLE}`)
  return 'OK';
};

async function batchWrite(items){
  let params = {
    RequestItems: {
      [process.env.ROUTING_TABLE]: items.map(item => (
        {
          PutRequest: {
            Item: {
              PK: {
                S: item.routing_number
              },
              name: {
                S: item.name
              },
              location: {
                S: item.location
              }
            }
          }
        }
      ))
    }
  }
  console.log(params);
  await dynamoClient.send(new BatchWriteItemCommand(params));
}
