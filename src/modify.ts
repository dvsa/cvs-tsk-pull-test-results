import 'source-map-support/register';
import { Context, Callback } from 'aws-lambda';
import logger from './observability/logger';
import { eventHandler } from './eventHandler';

const {
  NODE_ENV, SERVICE, AWS_REGION, AWS_STAGE,
} = process.env;

logger.debug(
  `\nRunning Service:\n '${SERVICE}'\n mode: ${NODE_ENV}\n stage: '${AWS_STAGE}'\n region: '${AWS_REGION}'\n\n`,
);

const handler = async (event: any, _context: Context, callback: Callback) => {
  try {
    logger.debug(`Function triggered with '${JSON.stringify(event)}'.`);
    if (process.env.PROCESS_MODIFY_EVENTS === 'true') {
      await eventHandler(event);
    } else {
      logger.info('Not handling modify events.');
    }

    logger.info('Data processed successfully.');
    callback(null, 'Data processed successfully.');
  } catch (error) {
    logger.info('Data processed unsuccessfully.');
    logger.error('', error);
    callback(new Error('Data processed unsuccessfully.'));
  }
};

export { handler };
