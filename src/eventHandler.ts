/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-unresolved */
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDBRecord, SQSEvent } from 'aws-lambda';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { TestResultSchema } from '@dvsa/cvs-type-definitions/types/v1/test-result';
import { TypeOfTest } from '@dvsa/cvs-type-definitions/types/v1/enums/typeOfTest.enum';
import { sendEvents } from './eventbridge/send';
import { EventType } from './interfaces/EventBridge';
import { TestActivity } from './interfaces/TestActivity';
import { TestAmendment } from './interfaces/TestAmendment';
import logger from './observability/logger';
import { extractAmendedBillableTestResults } from './utils/extractAmendedBillableTestResults';
import { extractBillableTestResults } from './utils/extractTestResults';

const eventHandler = async (event: SQSEvent) => {
  // We want to process these in sequence to maintain order of database changes
  for (const record of event.Records) {
    const dbRecord = JSON.parse(record.body) as DynamoDBRecord;

    switch (dbRecord.eventName) {
      case 'INSERT': {
        const currentRecord = unmarshall(dbRecord.dynamodb.NewImage as Record<string, AttributeValue>) as TestResultSchema;
        if (process.env.PROCESS_DESK_BASED_TESTS !== 'true' && currentRecord.typeOfTest === TypeOfTest.DESK_BASED as TypeOfTest) {
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
        const currentRecord = unmarshall(dbRecord.dynamodb.NewImage as Record<string, AttributeValue>) as TestResultSchema;
        const previousRecord = unmarshall(dbRecord.dynamodb.OldImage as Record<string, AttributeValue>) as TestResultSchema;
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
};

const eventTypeMap = new Map<TypeOfTest, EventType>([
  [TypeOfTest.CONTINGENCY, EventType.CONTINGENCY],
  [TypeOfTest.DESK_BASED, EventType.DESK_BASED],
]);

export { eventHandler };
