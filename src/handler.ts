/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'source-map-support/register';
import {
  DynamoDBStreamEvent, Context, Callback, DynamoDBRecord,
} from 'aws-lambda';
import { getSecret } from './utils/filterUtils';
import { formatDynamoData } from './utils/dataFormatter';
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

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    event.Records.forEach(async (record) => {
      if (secrets.includes(getTestStationNumber(record))) {
        const testActivity: TestActivity[] = formatDynamoData(record);
        await sendEvents(testActivity);
      } else {
        logger.debug(
          `Event not sent as non filtered ATF { PNumber: ${record.dynamodb.NewImage.testStationPNumber.S} }`,
        );
      }
    });

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
