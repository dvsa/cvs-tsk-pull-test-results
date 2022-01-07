/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'source-map-support/register';
import { DynamoDBStreamEvent, Context, Callback } from 'aws-lambda';
import logger from './observability/logger';

const {
  NODE_ENV, SERVICE, AWS_REGION, AWS_STAGE,
} = process.env;

logger.debug(
  `\nRunning Service:\n '${SERVICE}'\n mode: ${NODE_ENV}\n stage: '${AWS_STAGE}'\n region: '${AWS_REGION}'\n\n`,
);

logger.debug(
  `\nRunning Service:\n '${SERVICE}'\n mode: ${NODE_ENV}\n stage: '${AWS_STAGE}'\n region: '${AWS_REGION}'\n\n`,
);

const handler = (event: DynamoDBStreamEvent, _context: Context, callback: Callback) => {
  try {
    logger.debug(`Function triggered with '${JSON.stringify(event)}'.`);

    // TODO: Format and Send test results

    logger.info('Data processed successfully.');
    callback(null, 'Data processed successfully.');
  } catch (error) {
    logger.info('Data processed unsuccessfully.');
    logger.error('', error);
    callback(new Error('Data processed unsuccessfully.'));
  }
};
export { handler };
