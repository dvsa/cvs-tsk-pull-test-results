import 'source-map-support/register';
import { SQSEvent, SQSBatchResponse } from 'aws-lambda';
import logger from './observability/logger';
import { eventHandler } from './eventHandler';

const {
  NODE_ENV, SERVICE, AWS_REGION, AWS_STAGE,
} = process.env;

logger.debug(
  `\nRunning Service:\n '${SERVICE}'\n mode: ${NODE_ENV}\n stage: '${AWS_STAGE}'\n region: '${AWS_REGION}'\n\n`,
);

const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  logger.debug(`Function triggered with '${JSON.stringify(event)}'.`);

  if (process.env.PROCESS_MODIFY_EVENTS !== 'true') {
    logger.info('not handling modify events.');
    return { batchItemFailures: [] } as SQSBatchResponse;
  }
  const batchItemFailures = await eventHandler(event);
  logger.info('Data processed successfully.');
  return batchItemFailures;
};

export { handler };
