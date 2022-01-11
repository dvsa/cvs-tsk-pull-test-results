import { EventBridge } from 'aws-sdk';
import { EventEntry } from './EventEntry';
import { Entries } from './Entries';
import { SendResponse } from './SendResponse';
import logger from '../observability/logger';
import { TestActivity } from '../utils/testActivity';

const eventbridge = new EventBridge();
const sendEvents = async (testActivity: TestActivity): Promise<SendResponse> => {
  logger.info('sendEvents starting');
  logger.info('event ready to send to eventbridge.');

  const sendResponse: SendResponse = {
    SuccessCount: 0,
    FailCount: 0,
  };

  const entry: EventEntry = {
    Source: process.env.AWS_EVENT_BUS_SOURCE,
    // eslint-disable-next-line security/detect-object-injection
    Detail: `{ "testResult": "${JSON.stringify(testActivity)}`,
    DetailType: 'CVS ATF Test Results',
    EventBusName: process.env.AWS_EVENT_BUS_NAME,
    Time: new Date(),
  };

  const params: Entries = {
    Entries: [],
  };
  params.Entries.push(entry);

  try {
    logger.debug(`event about to be sent: ${JSON.stringify(params)}`);
    // eslint-disable-next-line no-await-in-loop
    await eventbridge.putEvents(params).promise();
    logger.info('event sent to eventbridge.');
    sendResponse.SuccessCount++;
  } catch (error) {
    logger.error('', error);
    sendResponse.FailCount++;
  }

  logger.info('sendEvents ending');

  return sendResponse;
};

export { sendEvents };
