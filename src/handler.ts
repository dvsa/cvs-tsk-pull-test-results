/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'source-map-support/register';
import { DynamoDBStreamEvent, Context, Callback } from 'aws-lambda';
import { getSecret } from './utils/filterUtils';
import { dataFormatter } from './utils/dataFormatter';
import { TestActivity } from './utils/testActivity';
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

    event.Records.forEach((record) => {
      if (secrets.includes(record.dynamodb.testStationPNumber)) {
        if (record.dynamodb.testTypeEndTimestamp !== "") {
          // Send test result
          let testActivity: TestActivity = dataFormatter(record);
          logger.info(testActivity)
        }
        else {
          logger.info(`Test result associated with EventID: ${record.eventId} was not completed, event has not been sent to EventBridge`)
        }
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
export { handler };
