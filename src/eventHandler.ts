/* eslint-disable no-restricted-syntax */
import { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { sendEvents } from './eventbridge/send';
import logger from './observability/logger';
import { extractAmendedBillableTestResults } from './utils/extractAmendedBillableTestResults';
import { Differences } from './utils/differences';
import { extractBillableTestResults } from './utils/extractTestResults';
import { getSecret } from './utils/filterUtils';
import { TestActivity } from './utils/testActivity';
import { TestResultModel } from './utils/testResult';
import { EventType } from './utils/eventType';

const eventHandler = async (event: DynamoDBStreamEvent) => {
  const secrets: string[] = await getSecret(process.env.SECRET_NAME);
  // We want to process these in sequence to maintain order of database changes
  for (const record of event.Records) {
    if (checkNonFilteredATF(record, secrets)) {
      const currentRecord = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as TestResultModel;
      switch (record.eventName) {
        case 'INSERT': {
          const testActivity: TestActivity[] = extractBillableTestResults(currentRecord);
          /* eslint-disable no-await-in-loop */
          await sendEvents(testActivity, EventType.COMPLETION);
          break;
        }
        case 'MODIFY': {
          const previousRecord = DynamoDB.Converter.unmarshall(record.dynamodb.OldImage) as TestResultModel;
          const amendmentChanges: Differences[] = extractAmendedBillableTestResults(currentRecord, previousRecord);
          /* eslint-disable no-await-in-loop */
          await sendEvents(amendmentChanges, EventType.AMENDMENT);
          break;
        }
        default:
          logger.error(`Unhandled event {event: ${record.eventName}}`);
          break;
      }
    } else {
      logger.debug('Event not sent as non filtered ATF');
    }
  }
};

function checkNonFilteredATF(record: DynamoDBRecord, secrets: string[]): boolean {
  if (
    secrets.includes(record?.dynamodb?.NewImage?.testStationPNumber?.S)
    || secrets.includes(record?.dynamodb?.OldImage?.testStationPNumber?.S)
  ) {
    return true;
  }
  return false;
}

export { checkNonFilteredATF, eventHandler };
