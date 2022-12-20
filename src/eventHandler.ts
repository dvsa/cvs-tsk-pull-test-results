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
import { TestResultModel, TypeOfTest } from './utils/testResult';
import { EventType } from './utils/eventType';

const eventHandler = async (event: DynamoDBStreamEvent) => {
  const secrets: string[] = await getSecret(process.env.SECRET_NAME);
  // We want to process these in sequence to maintain order of database changes
  for (const record of event.Records) {
    switch (record.eventName) {
      case 'INSERT': {
        const currentRecord = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as TestResultModel;
        const testActivity: TestActivity[] = extractBillableTestResults(
          currentRecord,
          checkNonFilteredATF(record, secrets),
        );
        const eventType = currentRecord.typeOfTest === TypeOfTest.CONTINGENCY ? EventType.CONTINGENCY : EventType.COMPLETION;
        /* eslint-disable no-await-in-loop */
        await sendEvents(testActivity, eventType);
        break;
      }
      case 'MODIFY': {
        if (checkNonFilteredATF(record, secrets)) {
          const currentRecord = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as TestResultModel;
          const previousRecord = DynamoDB.Converter.unmarshall(record.dynamodb.OldImage) as TestResultModel;
          const amendmentChanges: Differences[] = extractAmendedBillableTestResults(currentRecord, previousRecord);
          /* eslint-disable no-await-in-loop */
          await sendEvents(amendmentChanges, EventType.AMENDMENT);
        } else {
          logger.debug('Event not sent as non filtered ATF');
        }
        break;
      }
      default:
        logger.error(`Unhandled event {event: ${record.eventName}}`);
        break;
    }
  }
};

function checkNonFilteredATF(record: DynamoDBRecord, secrets: string[]): boolean {
  return (
    secrets.includes(record?.dynamodb?.NewImage?.testStationPNumber?.S)
    || secrets.includes(record?.dynamodb?.OldImage?.testStationPNumber?.S)
  );
}

export { checkNonFilteredATF, eventHandler };
