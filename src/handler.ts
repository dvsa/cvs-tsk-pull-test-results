/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'source-map-support/register';
import {
  DynamoDBStreamEvent, Context, Callback, DynamoDBRecord,
} from 'aws-lambda';
import { getSecret } from './utils/filterUtils';
import { extractBillableTestResults } from './utils/extractTestResults';
import { TestActivity } from './utils/testActivity';
import { sendEvents } from './eventbridge/send';
import logger from './observability/logger';

const {
  NODE_ENV, SERVICE, AWS_REGION, AWS_STAGE,
} = process.env;

logger.debug(
  `\nRunning Service:\n '${SERVICE}'\n mode: ${NODE_ENV}\n stage: '${AWS_STAGE}'\n region: '${AWS_REGION}'\n\n`,
);

const handler = async (event: DynamoDBStreamEvent, _context: Context, callback: Callback) => {
  try {
    logger.debug(`Function triggered with '${JSON.stringify(event)}'.`);
    const secrets: string[] = await getSecret(process.env.SECRET_NAME);

    // We want to process these in sequence to maintain order of database changes
    for (const record of event.Records) {
      if (secrets.includes(getTestStationNumber(record))) {
        const testActivity: TestActivity[] = extractBillableTestResults(record);
        // eslint-disable-next-line no-await-in-loop
        await sendEvents(testActivity);
      } else {
        logger.debug(`Event not sent as non filtered ATF { PNumber: ${getTestStationNumber(record)} }`);
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

function getTestStationNumber(record: DynamoDBRecord): string {
  return record.dynamodb.NewImage.testStationPNumber.S;
}

export { handler, getTestStationNumber };
