/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-restricted-syntax */
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDBRecord, SNSMessage, SQSEvent } from 'aws-lambda';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { sendEvents } from './eventbridge/send';
import { EventType } from './interfaces/EventBridge';
import { TestActivity } from './interfaces/TestActivity';
import { TestAmendment } from './interfaces/TestAmendment';
import { TestResultModel, TypeOfTest } from './interfaces/TestResult';
import logger from './observability/logger';
import { extractAmendedBillableTestResults } from './utils/extractAmendedBillableTestResults';
import { extractBillableTestResults } from './utils/extractTestResults';

const eventHandler = async (event: SQSEvent) => {
  logger.info(event);
  // We want to process these in sequence to maintain order of database changes
  for (const record of event.Records) {
    logger.info(record);
    const snsRecord: SNSMessage = JSON.parse(record.body) as SNSMessage;
    logger.info(snsRecord);
    const dynamoDBEventStr = snsRecord.Message;
    logger.info(dynamoDBEventStr);

    if (dynamoDBEventStr) {
      const dynamoDBEvent = JSON.parse(dynamoDBEventStr);
      logger.info(dynamoDBEvent);
      const dbRecord: DynamoDBRecord = JSON.parse(dynamoDBEvent) as DynamoDBRecord;
      logger.info(dbRecord);

      switch (dbRecord.eventName) {
        case 'INSERT': {
          const currentRecord = unmarshall(dbRecord.dynamodb.NewImage as any);
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
          const currentRecord = unmarshall(dbRecord.dynamodb.NewImage as Record<string, AttributeValue>) as TestResultModel;
          const previousRecord = unmarshall(dbRecord.dynamodb.OldImage as Record<string, AttributeValue>) as TestResultModel;
          const amendmentChanges: TestAmendment[] = extractAmendedBillableTestResults(currentRecord, previousRecord);
          /* eslint-disable no-await-in-loop */
          await sendEvents(amendmentChanges, EventType.AMENDMENT);
          break;
        }
        default:
          logger.error(`Unhandled event {event: ${dbRecord.eventName}}`);
          break;
      }
    }
  }
};

const eventTypeMap = new Map<TypeOfTest, EventType>([
  [TypeOfTest.CONTINGENCY, EventType.CONTINGENCY],
  [TypeOfTest.DESK_BASED, EventType.DESK_BASED],
]);

export { eventHandler };
