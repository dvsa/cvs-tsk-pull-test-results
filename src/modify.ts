import 'source-map-support/register';
import {
  Context, Callback, SQSEvent, SQSBatchResponse,
} from 'aws-lambda';
import logger from './observability/logger';
import { eventHandler } from './eventHandler';

const {
  NODE_ENV, SERVICE, AWS_REGION, AWS_STAGE,
} = process.env;

logger.debug(
  `\nRunning Service:\n '${SERVICE}'\n mode: ${NODE_ENV}\n stage: '${AWS_STAGE}'\n region: '${AWS_REGION}'\n\n`,
);

const handler = async (event: SQSEvent, _context: Context, callback: Callback): Promise<SQSBatchResponse> => {
  let batchItemFailures: SQSBatchResponse = { batchItemFailures: [] };
  try {
    logger.debug(`Function triggered with '${JSON.stringify(event)}'.`);

    if (process.env.PROCESS_MODIFY_EVENTS === 'true') {
      batchItemFailures = await eventHandler(event);
    } else {
      logger.info('Not handling modify events.');
    }

    logger.info('Data processed successfully.');
    callback(null, 'Data processed successfully.');
    return batchItemFailures;
  } catch (error) {
    logger.info('Data processed unsuccessfully.');
    logger.error('', error);
    callback(new Error('Data processed unsuccessfully.'));
    return batchItemFailures;
  }
};

export { handler };
