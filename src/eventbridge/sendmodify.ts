import { EventBridge } from 'aws-sdk';
import { EventEntry } from './EventEntry';
import { Entries } from './Entries';
import { SendResponse } from './SendResponse';
import logger from '../observability/logger';
import { Differences } from '../utils/differences';

const eventbridge = new EventBridge();
const sendModifyEvents = async (differences: Differences[]): Promise<SendResponse> => {
  logger.info('sendEvents starting');
  logger.info(`${differences.length} ${differences.length === 1 ? 'event' : 'events'} ready to send to eventbridge.`);

  const sendResponse: SendResponse = {
    SuccessCount: 0,
    FailCount: 0,
  };

  for (let i = 0; i < differences.length; i++) {
    const entry: EventEntry = {
      Source: process.env.AWS_EVENT_BUS_SOURCE,
      // eslint-disable-next-line security/detect-object-injection
      Detail: `{ "testResult": "${JSON.stringify(differences[i])?.replace(/"/g, '\\"')}" }, type: "Amendment"`,
      DetailType: 'CVS ATF Test Result',
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
      const result = await eventbridge.putEvents(params).promise();
      logger.info(`${result.Entries.length} ${result.Entries.length === 1 ? 'event' : 'events'} sent to eventbridge.`);
      sendResponse.SuccessCount++;
    } catch (error) {
      logger.error('', error);
      sendResponse.FailCount++;
    }
  }

  logger.info('sendEvents ending');

  return sendResponse;
};

export { sendModifyEvents };
