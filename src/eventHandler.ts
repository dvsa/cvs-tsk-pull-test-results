/* eslint-disable no-restricted-syntax */
import { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { sendEvents } from './eventbridge/send';
import logger from './observability/logger';
import { extractAmendedBillableTestResults } from './utils/extractAmendedBillableTestResults';
import { TestAmendment } from './interfaces/TestAmendment';
import { extractBillableTestResults } from './utils/extractTestResults';
import { getSecret } from './utils/getSecret';
import { TestActivity } from './interfaces/TestActivity';
import { TestResultModel, TypeOfTest } from './interfaces/TestResult';
import { EventType } from './interfaces/EventBridge';

const eventHandler = async (event: DynamoDBStreamEvent) => {
  const secrets: string[] = await getSecret(process.env.SECRET_NAME);
  // We want to process these in sequence to maintain order of database changes
  for (const record of event.Records) {
    if (checkNonFilteredATF(record, secrets)) {
      const currentRecord = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as TestResultModel;
      switch (record.eventName) {
        case 'INSERT': {
          if (process.env.PROCESS_DESK_BASED_TESTS !== 'true' && currentRecord.typeOfTest === TypeOfTest.DESK_BASED) {
            logger.info('Ignoring desk based test');
            break;
          }

          const testActivity: TestActivity[] = extractBillableTestResults(currentRecord);
          const eventType = eventTypeMap.get(currentRecord.typeOfTest) ?? EventType.COMPLETION;

          /* eslint-disable no-await-in-loop */
          await sendEvents(testActivity, eventType);
          break;
        }
        case 'MODIFY': {
          const previousRecord = DynamoDB.Converter.unmarshall(record.dynamodb.OldImage) as TestResultModel;
          const amendmentChanges: TestAmendment[] = extractAmendedBillableTestResults(currentRecord, previousRecord);
          /* eslint-disable no-await-in-loop */
          await sendEvents(amendmentChanges, EventType.AMENDMENT);
          break;
        }
        default:
          logger.error(`Unhandled event {event: ${record.eventName}}`);
          break;
      }
    } else {
      logger.info('Event not sent as non filtered ATF');
    }
  }
};

const eventTypeMap = new Map<TypeOfTest, EventType>([
  [TypeOfTest.CONTINGENCY, EventType.CONTINGENCY],
  [TypeOfTest.DESK_BASED, EventType.DESK_BASED],
]);

function checkNonFilteredATF(record: DynamoDBRecord, secrets: string[]): boolean {
  return (
    secrets.includes(record?.dynamodb?.NewImage?.testStationPNumber?.S)
    || secrets.includes(record?.dynamodb?.OldImage?.testStationPNumber?.S)
  );
}

export { checkNonFilteredATF, eventHandler };
