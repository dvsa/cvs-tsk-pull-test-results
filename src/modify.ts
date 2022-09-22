/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'source-map-support/register';
import {
  DynamoDBStreamEvent, Context, Callback, DynamoDBRecord,
} from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { getSecret } from './utils/filterUtils';
import logger from './observability/logger';
import { formatModifyPayload } from './utils/compareTestResults';
import { TestResultModel } from './utils/testResult';
import { Differences } from './utils/differences';
import { sendModifyEvents } from './eventbridge/sendmodify';

const {
  NODE_ENV, SERVICE, AWS_REGION, AWS_STAGE,
} = process.env;

logger.debug(
  `\nRunning Service:\n '${SERVICE}'\n mode: ${NODE_ENV}\n stage: '${AWS_STAGE}'\n region: '${AWS_REGION}'\n\n`,
);

const handler = async (event: DynamoDBStreamEvent, _context: Context, callback: Callback) => {
  try {
    logger.debug(`Function triggered with '${JSON.stringify(event)}'.`);
    if (!process.env.NO_MODIFY) {
      const secrets: string[] = await getSecret(process.env.SECRET_NAME);

      // We want to process these in sequence to maintain order of database changes
      for (const record of event.Records) {
        if (checkNonFilteredATF(record, secrets)) {
          const currentRecord = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as TestResultModel;
          const previousRecord = DynamoDB.Converter.unmarshall(record.dynamodb.OldImage) as TestResultModel;
          const amendmentChanges: Differences[] = formatModifyPayload(currentRecord, previousRecord);
          // eslint-disable-next-line no-await-in-loop
          await sendModifyEvents(amendmentChanges);
        } else {
          logger.debug('Event not sent as non filtered ATF');
        }
      }
    }

    logger.info('Data processed successfully.');
    callback(null, 'Data processed successfully.');
  } catch (error) {
    logger.info('Data processed unsuccessfully.');
    logger.error('', error);
    callback(new Error('Data processed unsuccessfully.'));
  }
};

function checkNonFilteredATF(record: DynamoDBRecord, secrets: string[]): boolean {
  if (
    secrets.includes(record.dynamodb.NewImage.testStationPNumber.S)
    || secrets.includes(record.dynamodb.OldImage.testStationPNumber.S)
  ) {
    return true;
  }
  return false;
}

export { handler, checkNonFilteredATF };
